# Produce offers: farmers say what they have, suppliers see it

A farmer opens **Tell suppliers what you have** (`/produce-offers`), says what they have, how much, and the
price they want. Suppliers on **Digital City Era (Supermartkera)** see it live in the **Farm Produce** tab of
their Supplier Portal, compare it, and call, WhatsApp or tap **I’m interested**. The farmer sees who is
interested, with their phone number, on the same page.

Both apps use the same Supabase project, so one SQL file serves both.

## Deploy
1. Run `backend/db/schemas/farm/12_produce_offers.sql` in the Supabase SQL editor (safe to run twice). It creates
   `farm_produce_offers` and `farm_produce_interests`, their row-level security, and switches on live updates.
2. Ship both apps. Until step 1 is done the farmer page says it is being set up and the supplier tab shows a setup
   note; nothing else in either app is affected.

## What the farmer does
- Pick the produce (a list of common crops, or type any), how much and in which unit (kg, ton, bag, crate, bunch,
  basket, tray, piece, litre), and the price for each unit in UGX. Choosing a crop fills in its usual unit.
- Say where it is (region and sub-region, optionally district or village) and give a phone number (filled in from
  the profile). Optionally: ready-from date, organic, a note.
- Choose how long the offer stays open: 3, 7 (default), 14 or 30 days. Offers close by themselves, so a supplier is
  never shown an old price. The database refuses anything longer than 60 days.
- **Price hint** under the price box: the other farmers’ live offers for the same crop, in the unit chosen (a ton
  price is compared with kilo prices): their range, the typical price, and how far above or below it the farmer is.
  It only calls a price “typical” once there are at least 3 other offers, and says how many it is based on.
- Manage offers: change price or amount (saving reopens the offer), pause, mark as sold, keep open 7 more days,
  delete. Each offer shows the suppliers who are interested.

## What the supplier sees (digital-city-era, Supplier Portal → Farm Produce)
- Every open offer, live: a new offer pops up with a notice, and the list refreshes on its own.
- **Market strip**: per crop, how many offers and the typical price.
- Each offer is compared with the typical price for that crop (“12% under market”, “46% above market”) with a bar
  showing where it sits between the cheapest and dearest offer.
- **Best deal / Newest / Nearest / Biggest** ordering. Choose your area (a sub-region) to put the closest farms first.
- Matched against the supplier’s own catalog: “In your catalog”, the margin if the supplier bought at the farmer’s
  price and sold at their catalog price (same unit only), and a “low in your stock” flag when the catalog item is
  at or below its minimum stock.
- Filters (In my catalog, Organic, Ready now, Near me only), search, and “New” badges for offers posted since the
  supplier last looked.
- Call, WhatsApp (message pre-written), or **I’m interested** with an optional message.

## Who can see and do what (enforced in the database)
- Any signed-in user can read an offer while it is **active** and not past its closing time. Owners always see
  their own. Signed-out visitors see nothing.
- Only the farmer can create, change or delete their offers.
- Only supplier-capable accounts (the same rule as the supplier portal: `supplier`, `admin`, or a `manager` of a
  supply-enabled store) can show interest, once per offer, and never in their own offer. The farmer and that
  supplier are the only people who can read an interest.
- Phone numbers on an offer are visible to every signed-in user who can read the offer, because the farmer posts
  them for buyers. The farmer page’s price comparison fetches only prices, never names or numbers.

## Known limits
- Prices are UGX only.
- Contact is by phone or WhatsApp; there is no in-app chat, order or payment for farm produce yet. “Interested”
  is shown to the farmer when they open the page; there is no push or SMS notification yet.
- “Typical” and “% under/over market” are the median of the live offers, not a forecast, and need 3 or more offers
  of the crop in the same unit.
- “Nearest” means same sub-region, then same region. It is not a distance.
- Catalog matching is by crop name; “Green beans” is shown as a similar item to “Beans”, with no margin worked out.

Tests: `npm run test:produce-offers` (in `frontend/`).
