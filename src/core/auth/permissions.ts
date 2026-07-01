export enum Permissions {
  SCAN_QR = 'SCAN_QR',
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  REGISTER_WALK_IN = 'REGISTER_WALK_IN',
  CREATE_PRE_APPROVED = 'CREATE_PRE_APPROVED',
  VIEW_OWN_VISITORS = 'VIEW_OWN_VISITORS',
  VIEW_ALL_VISITORS = 'VIEW_ALL_VISITORS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANUAL_VERIFY = 'MANUAL_VERIFY',
  ALL = 'ALL',
}

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  if (userPermissions.includes(Permissions.ALL)) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
};
