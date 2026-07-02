import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

const REFRESH_MS = 60_000;
const FALLBACK_UGX = 5000;

export const useMarketSnapshot = () => {
  const [snapshot, setSnap] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('ican_get_market_snapshot');
      if (!error && data?.[0]) setSnap(data[0]);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { snapshot, loading, refresh };
};

export const useLiveIcaneracoinPrice = () => {
  const { snapshot, loading, refresh } = useMarketSnapshot();
  return {
    priceUgx:        Number(snapshot?.price_ugx        ?? FALLBACK_UGX),
    priceUsd:        Number(snapshot?.price_usd        ?? 0),
    floorUgx:        Number(snapshot?.floor_ugx        ?? FALLBACK_UGX),
    appreciationPct: Number(snapshot?.appreciation_pct ?? 0),
    loading,
    refresh,
  };
};

export default useLiveIcaneracoinPrice;
