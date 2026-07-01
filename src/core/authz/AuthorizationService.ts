// Role-Based Access Control Definitions
export enum AppRole {
  ADMIN = 'ADMIN',
  HOST = 'HOST',
  SECURITY = 'SECURITY',
}

// Permission-Based Access Control Definitions
export enum AppPermission {
  SCAN_QR = 'SCAN_QR',
  MANUAL_VERIFY = 'MANUAL_VERIFY',
  REGISTER_WALK_IN = 'REGISTER_WALK_IN',
  CREATE_PRE_APPROVED = 'CREATE_PRE_APPROVED',
  APPROVE_VISIT = 'APPROVE_VISIT',
  VIEW_ALL_VISITS = 'VIEW_ALL_VISITS',
  VIEW_OWN_VISITS = 'VIEW_OWN_VISITS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

export const RolePermissionsMapping: Record<AppRole, AppPermission[]> = {
  [AppRole.ADMIN]: Object.values(AppPermission),
  [AppRole.SECURITY]: [
    AppPermission.SCAN_QR,
    AppPermission.MANUAL_VERIFY,
    AppPermission.REGISTER_WALK_IN,
    AppPermission.VIEW_ALL_VISITS,
  ],
  [AppRole.HOST]: [
    AppPermission.CREATE_PRE_APPROVED,
    AppPermission.APPROVE_VISIT,
    AppPermission.VIEW_OWN_VISITS,
  ],
};

export class AuthorizationService {
  /**
   * Evaluates if a given role has the requested permission
   */
  static hasPermission(role: string, permission: AppPermission): boolean {
    const roleKey = role as AppRole;
    if (!RolePermissionsMapping[roleKey]) return false;
    
    return RolePermissionsMapping[roleKey].includes(permission);
  }
}
