import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import { getRoleByName } from '../constants/roles';
import { api, apiClient } from '../utils/api';

// 当前登录
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (accessKey: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasMinimumLevel: (level: number) => boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
      loading: false,
      error: null,

      login: async (accessKey: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.auth.login(accessKey);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // 设置API客户端的token
            apiClient.setToken(token);
            
            // 处理管理员登录
            if (user.type === 'admin') {
              const adminRole = {
                id: 'super_admin',
                name: 'super_admin',
                displayName: '超级管理员',
                color: '#ff4d4f',
                level: 100,
                permissions: [] // 管理员拥有所有权限
              };
              
              const adminUser: User = {
                ...user,
                role: adminRole
              };
              
              set({
                user: adminUser,
                token,
                isAuthenticated: true,
                permissions: ['*'], // 管理员拥有所有权限
                loading: false,
                error: null
              });
              return;
            }

            // 处理坐席登录
            const role = getRoleByName(user.role) || {
              id: 'agent',
              name: 'agent',
              displayName: '普通客服',
              color: '#722ed1',
              level: 30,
              permissions: []
            };
            
            const agentUser: User = {
              ...user,
              role
            };
            
            set({
              user: agentUser,
              token,
              isAuthenticated: true,
              permissions: role.permissions.map(p => p.name),
              loading: false,
              error: null
            });
          } else {
            throw new Error(response.message || '登录失败');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登录失败';
          set({ 
            loading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            permissions: []
          });
          throw error;
        }
      },

      logout: () => {
        // 调用后端登出API
        api.auth.logout().catch(console.error);
        
        // 清除API客户端的token
        apiClient.setToken(null);
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
          loading: false,
          error: null
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