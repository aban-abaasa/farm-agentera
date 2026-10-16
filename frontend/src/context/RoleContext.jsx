import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getMyApplications } from '../services/api/pathwayService';
import { pathwayToRole, roleOrder } from '../content/agribone';

/**
 * Account roles for the signed-in person.
 *
 * Everyone is a `customer`. A `farmer` comes from the sign-up profile; a
 * `supplier` or `specialist` (farm specialist) comes from an approved
 * pathway application. Roles accumulate — a person can hold several and
 * switch between them in /account.
 */
const RoleContext = createContext(null);

const ACTIVE_KEY = 'agribone_active_role';

const readStoredRole = () => {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
};

const storeRole = (role) => {
  try {
    localStorage.setItem(ACTIVE_KEY, role);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRoleState] = useState(readStoredRole);

  const userId = user?.id;
  const profileRole = (user?.role || user?.user_role || '').toString().trim().toLowerCase();

  const refresh = useCallback(async () => {
    if (!userId) {
      setApplications([]);
      return;
    }
    setLoading(true);
    try {
      setApplications(await getMyApplications(userId));
    } catch (err) {
      // Roles still work (customer / farmer) if applications can't be read.
      console.error('[RoleContext] could not load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  // Land on the last role used; otherwise the person's "highest" business role.
  const resolvedRole = useMemo(() => {
    if (!roles.length) return 'customer';
    if (activeRole && roles.includes(activeRole)) return activeRole;
    return [...roles].reverse().find((r) => r !== 'customer') || 'customer';
  }, [roles, activeRole]);

  const setActiveRole = useCallback((role) => {
    setActiveRoleState(role);
    storeRole(role);
  }, []);

  const value = useMemo(
    () => ({ roles, activeRole: resolvedRole, setActiveRole, applications, applicationByPathway, loading, refresh }),
    [roles, resolvedRole, setActiveRole, applications, applicationByPathway, loading, refresh],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoles = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoles must be used inside <RoleProvider>');
  return ctx;
};
