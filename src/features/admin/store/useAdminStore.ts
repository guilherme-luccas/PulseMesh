import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isAdminCode } from '../admin.constants';
import { mmkvStateStorage } from '../../../services/database/mmkvStorage';

interface AdminStoreState {
  unlocked: boolean;
  error: string | null;
  unlock: (code: string) => boolean;
  lock: () => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      unlocked: false,
      error: null,
      unlock: (code) => {
        if (!isAdminCode(code)) {
          set({ error: 'Código incorreto.' });
          return false;
        }

        set({ unlocked: true, error: null });
        return true;
      },
      lock: () => set({ unlocked: false, error: null }),
    }),
    {
      name: 'pulsemesh.admin',
      storage: createJSONStorage(() => mmkvStateStorage),
      partialize: (state) => ({ unlocked: state.unlocked }),
    },
  ),
);
