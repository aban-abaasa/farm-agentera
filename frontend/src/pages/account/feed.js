import { DIGITAL_CITY_URL, PITCHIN_URL } from '../../content/agribone';

/** Which pathway application belongs to which account role. */
const ROLE_PATHWAY = { supplier: 'supplier', specialist: 'support' };

const NEXT_STEPS = {
  customer: [
    { id: 'todo-wallet', title: 'Fund your ICAN wallet', body: 'Orders are paid from your wallet.', to: '/ican-wallet', cta: 'Open wallet' },
    { id: 'todo-order', title: 'Place your first order', body: 'Buy straight from farmers, stores and suppliers.', to: '/marketplace', cta: 'Browse the market' },
  ],
  farmer: [
    { id: 'todo-pitchin', title: 'Create your business profile', body: 'Pitch your farm once in PitchIn.', href: PITCHIN_URL, cta: 'Open PitchIn' },
    { id: 'todo-verify', title: 'Get verified on the ground', body: 'A farm specialist in your sub-region can verify you.', to: '/support-team', cta: 'Find a specialist' },
    { id: 'todo-list', title: 'List your first produce', body: 'Put your outputs on the market.', to: '/marketplace/create', cta: 'Create a listing' },
  ],
  supplier: [
    { id: 'todo-dce', title: 'Set up your supplier account', body: 'Orders, stock and deliveries are handled on Digital City Era.', href: DIGITAL_CITY_URL, cta: 'Open Digital City Era' },
    { id: 'todo-pitchin', title: 'Create your business profile', body: 'Pitch your business once in PitchIn.', href: PITCHIN_URL, cta: 'Open PitchIn' },
    { id: 'todo-list', title: 'List your first product', body: 'Farmers find you through the market.', to: '/marketplace/create', cta: 'Create a listing' },
  ],
  specialist: [
    { id: 'todo-pitchin', title: 'Create your business profile', body: 'Show farmers who you are and what you can do.', href: PITCHIN_URL, cta: 'Open PitchIn' },
    { id: 'todo-qa', title: 'Help a farmer', body: 'Answer a question in the community.', to: '/community/qa', cta: 'Open questions' },
    { id: 'todo-messages', title: 'Check your messages', body: 'Farmers reach you here.', to: '/messages', cta: 'Open messages' },
  ],
};

/**
 * Build the feed for one role: what really happened to the person's
 * application (newest first), then the next steps for that role.
 */
export const buildFeed = (role, applications) => {
  const pathway = ROLE_PATHWAY[role];
  const events = [];

  applications
    .filter((a) => a.pathway === pathway)
    .forEach((a) => {
      events.push({ id: `filed-${a.id}`, tone: 'info', title: 'Application filed', body: 'With the AgriBone developer panel.', when: a.created_at });
      if (a.reviewed_at && a.status !== 'pending') {
        const approved = a.status === 'approved';
        events.push({
          id: `reviewed-${a.id}`,
          tone: approved ? 'success' : 'warning',
          title: approved ? 'Application approved' : 'Application not approved',
          body: a.review_note || (approved ? 'Welcome aboard.' : 'You may amend it and apply again.'),
          when: a.reviewed_at,
        });
      }
    });

  events.sort((x, y) => new Date(y.when) - new Date(x.when));
  return [...events, ...(NEXT_STEPS[role] || []).map((s) => ({ ...s, tone: 'todo' }))];
};
