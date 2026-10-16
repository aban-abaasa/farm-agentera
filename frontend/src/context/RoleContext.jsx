import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getMyApplications } from '../services/api/pathwayService';
import { getMyCompanies } from '../services/api/businessService';
import { accountRoles, pathwayToRole, roleOrder } from '../content/agribone';

/**
 * Account roles for the signed-in person.
 *
 * Everyone is a `customer` and lands on the customer page. A `farmer` comes from the profile; a
 * `supplier` or `specialist` (farm specialist) comes from an approved
 * pathway application. Roles accumulate — a person can hold several and
 * switch between them in /account.
 */
const RoleContext = createContext(null);

const companyKey = (role) => `agribone_company_${role}`;
const activeRoleKey = (userId) => `agribone_active_role_${userId}`;

const readStored = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyChoice, setCompanyChoice] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRoleState] = useState('customer');

  const userId = user?.id;
  const profileRole = (user?.role || user?.user_role || '').toString().trim().toLowerCase();

  const userEmail = user?.email;

  const refresh = useCallback(async () => {
    if (!userId) {
      setApplications([]);
      setCompanies([]);
      return;
    }
    setLoading(true);
    // Applications and companies are independent: one failing never blocks the other.
    const [apps, cos] = await Promise.allSettled([getMyApplications(userId), getMyCompanies(userId, userEmail)]);
    if (apps.status === 'fulfilled') {
      setApplications(apps.value);
    } else {
      console.error('[RoleContext] could not load applications:', apps.reason);
      setApplications([]);
    }
    if (cos.status === 'fulfilled') {
      setCompanies(cos.value);
    } else {
      console.error('[RoleContext] could not load companies:', cos.reason);
      setCompanies([]);
    }
    setLoading(false);
  }, [userId, userEmail]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const roles = useMemo(() => {
    if (!userId) return [];
    const held = new Set(['customer']);
    if (profileRole === 'farmer') held.add('farmer');
    applications
      .filter((a) => a.status === 'approved' && pathwayToRole[a.pathway])
      .forEach((a) => held.add(pathwayToRole[a.pathway]));
    return roleOrder.filter((r) => held.has(r));
  }, [userId, profileRole, applications]);

  // Latest application per pathway, for "pending" / "rejected" badges.
  const applicationByPathway = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      if (!map[a.pathway]) map[a.pathway] = a; // list is newest-first
    });
    return map;
  }, [applications]);

  // Everyone lands on the customer page. The active tab is a held role, or
  // `become:<role>` for a role the person has not got yet.
  const resolvedRole = useMemo(() => {
    if (roles.includes(activeRole)) return activeRole;
    if (activeRole?.startsWith('become:') && !roles.includes(activeRole.slice(7))) return activeRole;
    return 'customer';
  }, [roles, activeRole]);

  // Remember which role the person was using, so a reload or a later visit opens the same page.
  useEffect(() => {
    if (!userId) {
      setActiveRoleState('customer');
      return;
    }
    const saved = readStored(activeRoleKey(userId));
    if (saved) setActiveRoleState(saved);
  }, [userId]);

  const setActiveRole = useCallback(
    (role) => {
      setActiveRoleState(role);
      // Only a held role is remembered; "become:<role>" is just a tab the person is looking at.
      if (userId && role && !role.startsWith('become:')) writeStored(activeRoleKey(userId), role);
    },
    [userId],
  );

  /**
   * The company a role runs as, read from PitchIn / CMMS. Picked by, in order:
   * the person's own choice, the reference they gave on their application,
   * then the first company they have.
   */
  const companyForRole = useCallback(
    (role) => {
      if (!companies.length) return null;
      const chosen = companyChoice[role] ?? readStored(companyKey(role));
      const byChoice = chosen && companies.find((c) => c.key === chosen);
      if (byChoice) return byChoice;
      const ref = (applicationByPathway[accountRoles[role]?.pathway]?.pitchin_ref || '').trim().toLowerCase();
      const byRef = ref && companies.find((c) =>
        [c.pitchinId, c.cmmsId, c.registration, c.name].some((v) => v && String(v).toLowerCase() === ref));
      return byRef || companies[0];
    },
    [companies, companyChoice, applicationByPathway],
  );

  const setCompanyForRole = useCallback((role, key) => {
    setCompanyChoice((prev) => ({ ...prev, [role]: key }));
    writeStored(companyKey(role), key);
  }, []);

  const value = useMemo(
    () => ({
      roles, activeRole: resolvedRole, setActiveRole, applications, applicationByPathway,
      companies, companyForRole, setCompanyForRole, loading, refresh,
    }),
    [roles, resolvedRole, setActiveRole, applications, applicationByPathway,
      companies, companyForRole, setCompanyForRole, loading, refresh],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoles = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoles must be used inside <RoleProvider>');
  return ctx;
};
