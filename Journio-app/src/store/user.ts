import { login } from '@/api/user';
import { UserInfo } from '@/mock/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userInfo: UserInfo | null;
  token: string;
  loading: boolean;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setToken: (token: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: '',
      loading: false,

      setUserInfo: (userInfo) => set({ userInfo }),
      setToken: (token) => set({ token }),

      login: async (username, password) => {
        set({ loading: true });
        try {
          const res = await login({ username, password });
          if (res.code === 200) {
            set({
              userInfo: res.data,
              token: res.data.token,
            });
          } else {
            throw new Error(res.message);
          }
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        set({ userInfo: null, token: '' });
      },
    }),
    {
      name: 'user-storage',
    },
  ),
);
