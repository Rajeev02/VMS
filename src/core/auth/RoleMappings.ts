import { Permissions } from './permissions';

export const RolePermissionMap: Record<string, string[]> = {
  'Super Admin': [Permissions.ALL],
  'Company Admin': [
    Permissions.VIEW_ALL_VISITORS,
    Permissions.MANAGE_USERS,
    Permissions.CREATE_PRE_APPROVED,
    Permissions.CHECK_IN,
    Permissions.CHECK_OUT,
  ],
  'Receptionist': [
    Permissions.VIEW_ALL_VISITORS,
    Permissions.REGISTER_WALK_IN,
    Permissions.CREATE_PRE_APPROVED,
    Permissions.CHECK_IN,
    Permissions.CHECK_OUT,
  ],
  'Security Guard': [
    Permissions.VIEW_ALL_VISITORS,
    Permissions.SCAN_QR,
    Permissions.CHECK_IN,
    Permissions.CHECK_OUT,
    Permissions.REGISTER_WALK_IN,
    Permissions.MANUAL_VERIFY,
  ],
  'Security Officer': [
    Permissions.VIEW_ALL_VISITORS,
    Permissions.SCAN_QR,
    Permissions.CHECK_IN,
    Permissions.CHECK_OUT,
    Permissions.REGISTER_WALK_IN,
    Permissions.MANUAL_VERIFY,
  ],
  'Host': [
    Permissions.VIEW_OWN_VISITORS,
    Permissions.CREATE_PRE_APPROVED,
  ],
  'Standard Employee': [
    Permissions.VIEW_OWN_VISITORS,
  ],
};

export const getPermissionsForRole = (role: string | undefined): string[] => {
  if (!role) return [];
  return RolePermissionMap[role] || [];
};
