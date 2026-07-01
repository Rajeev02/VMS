import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { hasPermission } from './permissions';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <>{fallback}</>;
  }

  const isAllowed = hasPermission(user.permissions, permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
