/**
 * AgriBone — product content.
 *
 * Single source of truth for the pathways (who uses AgriBone), the farmer's
 * journey, the on-ground charter and the form options. Pages render from
 * here so the copy stays consistent between the landing page, /join and
 * the application forms.
 */

export const CMMS_URL = import.meta.env.VITE_ICANERA_CMMS_URL || 'https://icanera.space/#cmms';
export const PITCHIN_URL = import.meta.env.VITE_PITCHIN_URL || 'https://icanera.space';

/**
 * `mode: 'direct'`  – no vetting, the pathway page just points the person
 *                     at the right place in the app.
 * `mode: 'apply'`   – the person submits an application which the AgriBone
 *                     developer panel approves or declines.
 */
export const pathways = [
  {
    slug: 'customer',
    numeral: 'I',
    title: 'Customer',
    tagline: 'Buy at the source.',
    summary:
      'Order directly from farmers, stores and suppliers. Farm produce comes to you without the long chain of middlemen.',
    mode: 'direct',
    can: [
      'Order straight from farmers',
      'Buy from stores and suppliers',
      'Add transport delivery to an order',
    ],
    requires: ['A free AgriBone account', 'An ICAN wallet to pay with'],
    start: { label: 'Browse the market', to: '/marketplace' },
  },
  {
    slug: 'farmer',
    numeral: 'II',
    title: 'Farmer',
    tagline: 'Manage your farm.',
    summary:
      'Run your whole farm from one desk. Create a business profile in PitchIn — or register a company — and be verified by on-ground support.',
    mode: 'direct',
    can: [
      'Find a manager or partner when you need one',
      'Track livestock, inputs and customer orders in CMMS',
      'List and sell your farm outputs',
    ],
    requires: ['A PitchIn business profile or a registered company', 'Verification by on-ground support'],
    start: { label: 'Open My Farm', to: '/farm-management' },
  },
  {
    slug: 'support',
    numeral: 'III',
    title: 'On-Ground Support',
    tagline: 'Be AgriBone where you live.',
    summary:
      'Become the eyes and hands of AgriBone in your area. Tell us where you work and what you can do — land specialist, community liaison, farm specialist — and the AgriBone developer panel approves your scope.',
    mode: 'apply',
    can: [
      'Verify farms and business profiles in your sub-region',
      'Serve as a land specialist or community liaison',
      'Be connected to farmers who need a verified specialist',
    ],
    requires: [
      'The area and sub-region you will cover',
      'What you can do, stated plainly',
      'Approval by the AgriBone developer panel',
    ],
    start: { label: 'Apply to serve', to: '/join/support' },
  },
  {
    slug: 'supplier',
    numeral: 'IV',
    title: 'Supplier',
    tagline: 'Supply the farm.',
    summary:
      'Supply inputs and equipment to farmers to AgriBone supplier standards — and, if you wish, supply human labour too.',
    mode: 'apply',
    can: [
      'Supply seed, feed, inputs, tools and equipment',
      'Supply human labour to farms',
      'Receive orders and settle in ICAN',
    ],
    requires: ['A registered business or PitchIn profile', 'Agreement to the supplier standards'],
    start: { label: 'Apply to supply', to: '/join/supplier' },
  },
  {
    slug: 'partner',
    numeral: 'V',
    title: 'Partner & Investor',
    tagline: 'Back a farmer.',
    summary:
      'Support, partner with or invest in farmers. PitchIn gives you the documents you need to see before you commit.',
    mode: 'apply',
    can: [
      'Partner with a farmer who needs a manager',
      'Invest in verified farms',
      'Read business documents through PitchIn',
    ],
    requires: ['A PitchIn profile', 'A short note on how you want to support'],
    start: { label: 'Register interest', to: '/join/partner' },
  },
];

export const getPathway = (slug) => pathways.find((p) => p.slug === slug);

/** The farmer's road, from the hand-drawn timeline. */
export const journey = [
  {
    step: 'I',
    title: 'Find a manager',
    body: 'Need help running the farm? Partner up and connect with available, verified farm specialists.',
    to: '/support-team',
    link: 'Meet the specialists',
  },
  {
    step: 'II',
    title: 'Establish your business',
    body: 'Create a business profile in PitchIn, or register a company. On-ground support verifies you in person.',
    to: '/join/farmer',
    link: 'How verification works',
  },
  {
    step: 'III',
    title: 'Keep the books',
    body: 'Use CMMS for inventory tracking: livestock, farm inputs and customer orders. Mechanics plug in here too.',
    to: '/inventory-management',
    link: 'Open inventory',
  },
  {
    step: 'IV',
    title: 'List & sell',
    body: 'Put your farm outputs on the market and sell to customers, stores and suppliers.',
    to: '/marketplace',
    link: 'Visit the market',
  },
  {
    step: 'V',
    title: 'Settle in ICAN',
    body: 'Every transaction is settled on the ICAN wallet, so every sale leaves a record.',
    to: '/ican-wallet',
    link: 'Open the wallet',
  },
];

/** Charter of the on-ground team. */
export const charter = [
  {
    heading: 'Where',
    body: 'Name the area and sub-region you will cover. You serve there, and only there.',
  },
  {
    heading: 'What',
    body: 'State what you can do — land specialist, community liaison, farm verifier, mechanic. Your approved scope is what farmers will see.',
  },
  {
    heading: 'Approval',
    body: 'Every application is reviewed and approved by the AgriBone developer panel before you can act.',
  },
];

/** UBOS sub-regions of Uganda, grouped by region. */
export const regions = {
  Central: ['Kampala', 'Buganda North', 'Buganda South'],
  Eastern: ['Busoga', 'Bukedi', 'Bugisu', 'Teso', 'Karamoja'],
  Northern: ['Lango', 'Acholi', 'West Nile'],
  Western: ['Bunyoro', 'Tooro', 'Ankole', 'Kigezi'],
};

export const supportCapabilities = [
  'Land specialist',
  'Community liaison',
  'Farm verification visits',
  'Crop agronomy',
  'Livestock & veterinary',
  'Soil & irrigation',
  'Mechanic (equipment & machinery)',
  'Produce quality & grading',
];

export const supplierCategories = [
  'Seed & seedlings',
  'Fertiliser & agro-chemicals',
  'Animal feed & veterinary inputs',
  'Tools, equipment & machinery',
  'Packaging & storage',
  'Human labour',
];

export const supplierStandards = [
  'My goods and services are described honestly, with clear units and prices.',
  'I deliver within the time I promise, or tell the farmer early.',
  'Where I supply labour, workers are paid fairly and work safely.',
  'I accept orders and payment through the ICAN wallet.',
];

export const partnerModes = [
  'Partner with a farmer (management / know-how)',
  'Invest in a farm or project',
  'Donate or sponsor equipment',
  'Offer land or facilities',
];
