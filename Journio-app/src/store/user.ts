import { login, updateUserInfo } from '@/api/user';
import { UserInfo, UserUpdateParams } from '@/mock/user';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const TOKEN_KEY = 'token';

// 获取 localStorage 中的 token
const getTokenFromLocalStorage = () => localStorage.getItem(TOKEN_KEY);

// 设置 token 到 localStorage
const setTokenToLocalStorage = (token: string) => localStorage.setItem(TOKEN_KEY, token);

// 从 localStorage 中移除 token
const removeTokenFromLocalStorage = () => localStorage.removeItem(TOKEN_KEY);

interface UserState {
  userInfo: UserInfo | null;
  token: string;
  loading: boolean;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setToken: (token: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateInfo: (params: UserUpdateParams) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: getTokenFromLocalStorage() || '',
      loading: false,

      setUserInfo: (userInfo) => set({ userInfo }),
      setToken: (token) => {
        setTokenToLocalStorage(token);
        set({ token });
      },

      login: async (username, password) => {
        set({ loading: true });
        try {
          const res = await login({ username, password });
          if (res.code === 200) {
            const { token, ...userData } = res.data;
            setTokenToLocalStorage(token);
            set({
              userInfo: userData as UserInfo,
              token,
            });
          } else {
            throw new Error(res.message);
          }
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        removeTokenFromLocalStorage();
        // document.documentElement.setAttribute('data-theme', 'light');
        set({ userInfo: null, token: '', theme: 'light' });
      },

      updateInfo: async (params) => {
        set({ loading: true });
        try {
          const res = await updateUserInfo(params);
          if (res.code === 200) {
            set({
              userInfo: res.data,
            });
          } else {
            throw new Error(res.message);
          }
        } finally {
          set({ loading: false });
        }
      },
      theme: 'light',

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userInfo: state.userInfo, theme: state.theme }),
    },
  ),
);
    