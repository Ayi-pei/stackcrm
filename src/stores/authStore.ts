import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import { getRoleByName } from '../constants/roles';

// 当前登录
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (userData: any, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasMinimumLevel: (level: number) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      login: (userData: any, token: string) => {
        // 处理管理员登录
        if (userData.role === 'super_admin' || userData.role === 'admin') {
          const adminRole = {
            id: 'super_admin',
            name: 'super_admin',
            displayName: '超级管理员',
            color: '#ff4d4f',
            level: 100,
            permissions: [] // 管理员拥有所有权限
          };
          
          const user: User = {
            ...userData,
            role: adminRole
          };
          
          set({
            user,
            token,
            isAuthenticated: true,
            permissions: ['*'] // 管理员拥有所有权限
          });
          return;
        }

        // 处理坐席登录
        const role = getRoleByName(userData.role) || {
          id: 'agent',
          name: 'agent',
          displayName: '普通客服',
          color: '#722ed1',
          level: 30,
          permissions: []
        };
        
        const user: User = {
          ...userData,
          role
        };
        
        set({
          user,
          token,
          isAuthenticated: true,
          permissions: role.permissions.map(p => p.name)
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: []
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData }
          });
        }
      },

      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes('*') || permissions.includes(permission);
      },

      hasRole: (roleName: string) => {
        const { user } = get();
        return user?.role.name === roleName;
      },

      hasMinimumLevel: (level: number) => {
        const { user } = get();
        return (user?.role.level || 0) >= level;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
);