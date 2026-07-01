import { hasPermission, Permissions } from '../permissions';

describe('Permissions Utility', () => {
  it('should grant access if user has ALL permission', () => {
    expect(hasPermission([Permissions.ALL], Permissions.SCAN_QR)).toBe(true);
  });

  it('should grant access if user has the specific permission', () => {
    expect(hasPermission([Permissions.SCAN_QR, Permissions.CHECK_IN], Permissions.SCAN_QR)).toBe(true);
  });

  it('should deny access if user lacks the specific permission', () => {
    expect(hasPermission([Permissions.CHECK_IN], Permissions.SCAN_QR)).toBe(false);
  });

  it('should deny access if user has no permissions', () => {
    expect(hasPermission([], Permissions.SCAN_QR)).toBe(false);
  });
});
