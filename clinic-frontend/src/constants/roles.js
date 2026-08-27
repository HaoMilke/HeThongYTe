export const ROLES = {
  PATIENT: 'ROLE_PATIENT',
  DOCTOR: 'ROLE_DOCTOR',
  RECEPTIONIST: 'ROLE_RECEPTIONIST',
  ADMIN: 'ROLE_ADMIN',
};

export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.PATIENT,
];

export const getPrimaryRole = (roles = []) => {
  if (!roles || roles.length === 0) return ROLES.PATIENT;
  const roleStrings = roles.map((r) => (typeof r === 'string' ? r : r.name));
  for (const role of ROLE_HIERARCHY) {
    if (roleStrings.includes(role)) return role;
  }
  return ROLES.PATIENT;
};

export const getRoleRedirectPath = (roles = []) => {
  const primaryRole = getPrimaryRole(roles);
  switch (primaryRole) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.RECEPTIONIST:
      return '/receptionist/dashboard';
    case ROLES.DOCTOR:
      return '/doctor/dashboard';
    case ROLES.PATIENT:
    default:
      return '/patient/dashboard';
  }
};
