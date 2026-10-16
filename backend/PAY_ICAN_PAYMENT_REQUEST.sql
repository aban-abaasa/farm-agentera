-- ===========================================================================
-- PAY ICAN PAYMENT REQUEST (atomic QR / payment-code payments in ICAN coin)
-- ===========================================================================
-- Why this exists
--   The client used to do two separate steps when paying a scanned request:
--     1. transfer_ican()                       -> moves the coins
--     2. UPDATE payment_requests SET completed -> closes the request
--   RLS only lets the request OWNER update a row ("Users can update their own
--   payment requests"), and the payer is by definition someone else, so step 2
--   silently matched zero rows. The coins moved but the request stayed
--   'pending', so the same QR could be paid again and again.
--
-- This function does both steps in ONE transaction, locks the request row, and
-- always uses auth.uid() as the payer (the client cannot choose who pays).
-- Same pattern as the existing cash-payment recorder in
-- CREATE_PAYMENT_REQUESTS_TABLE.sql.
--
-- Depends on (already present in the shared database):
--   public.payment_requests (+ ican_tx_id column, 'ICAN' currency allowed)
--   public.transfer_ican(...)  12-parameter version
-- Safe to run multiple times.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.pay_ican_payment_request(
  p_payment_code TEXT,
  p_source_app   TEXT DEFAULT 'farm-agent'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payer    UUID := auth.uid();
  v_req      public.payment_requests%ROWTYPE;
  v_transfer JSONB;
BEGIN
  IF v_payer IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sign in is required to pay');
  END IF;

  -- Lock the row so two scans of the same code cannot both succeed.
  SELECT * INTO v_req
  FROM public.payment_requests
  WHERE payment_code = trim(p_payment_code)
    AND currency = 'ICAN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request not found');
  END IF;
  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('This payment request was already %s', v_req.status));
  END IF;
  IF v_req.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This payment request has expired');
  END IF;
  IF v_req.user_id = v_payer THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot pay your own request');
  END IF;

  v_transfer := public.transfer_ican(
    p_from_user              => v_payer,
    p_to_user                => v_req.user_id,
    p_amount                 => v_req.amount,
    p_note                   => COALESCE(NULLIF(v_req.description, ''), 'QR payment'),
    p_source_app             => COALESCE(NULLIF(p_source_app, ''), 'farm-agent'),
    p_reference_id           => v_req.id::text,
    p_local_amount           => NULL,
    p_local_currency         => 'UGX',
    p_merchant_name          => NULL,
    p_counterparty_type      => NULL,
    p_expense_classification => NULL,
    p_business_profile_id    => NULL
  );

  -- Insufficient balance, bad source app, etc.: nothing moved, request stays open.
  IF NOT COALESCE((v_transfer ->> 'success')::boolean, false) THEN
    RETURN v_transfer;
  END IF;

  UPDATE public.payment_requests
     SET status        = 'completed',
         payer_user_id = v_payer,
         ican_tx_id    = (v_transfer ->> 'out_tx_id')::uuid,
         completed_at  = now(),
         updated_at    = now()
   WHERE id = v_req.id;

  RETURN v_transfer || jsonb_build_object(
    'request_id',   v_req.id,
    'payment_code', v_req.payment_code,
    'recipient_user_id', v_req.user_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.pay_ican_payment_request(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_ican_payment_request(TEXT, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
