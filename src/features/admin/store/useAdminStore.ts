import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ApiError } from '../../../services/api/httpClient';
import { adminApi } from '../../../services/api/adminApi';
import { mmkvStateStorage } from '../../../services/database/mmkvStorage';

interface AdminStoreState {
  unlocked: boolean;
  token: string | null;
  error: string | null;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      unlocked: false,
      token: null,
      error: null,
      unlock: async (code) => {
        try {
          const session = await adminApi.session(code);
          set({ unlocked: true, token: session.token, error: null });
          return true;
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Sem servidor para validar o código.';
          set({ error: message });
          return false;
        }
      },
      lock: () => set({ unlocked: false, token: null, error: null }),
    }),
    {
      name: 'pulsemesh.admin',
      storage: createJSONStorage(() => mmkvStateStorage),
      partialize: (state) => ({ unlocked: state.unlocked, token: state.token }),
    },
  ),
);
