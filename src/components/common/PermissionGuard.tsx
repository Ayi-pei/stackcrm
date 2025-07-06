import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  minimumLevel?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  minimumLevel,
  fallback = null,
  children
}) => {
  const { hasPermission, hasRole, hasMinimumLevel } = useAuthStore();

  // 检查权限
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // 检查角色
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // 检查最低级别
  if (minimumLevel && !hasMinimumLevel(minimumLevel)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 高阶组件版本
export const withPermission = (
  Component: React.ComponentType<any>,
  permission?: string,
  role?: string,
  minimumLevel?: number,
  fallback?: React.ReactNode
) => {
  return (props: any) => (
    <PermissionGuard
      permission={permission}
      role={role}
      minimumLevel={minimumLevel}
      fallback={fallback}
    >
      <Component {...props} />
    </PermissionGuard>
  );
};