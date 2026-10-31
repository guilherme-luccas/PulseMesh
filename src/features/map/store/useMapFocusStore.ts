import { create } from 'zustand';

export type AppTab = 'alerts' | 'map';

interface MapFocusState {
  tab: AppTab;
  selectedAlertId: string | null;
  setTab: (tab: AppTab) => void;
  focusAlert: (id: string) => void;
}

export const useMapFocusStore = create<MapFocusState>()((set) => ({
  tab: 'alerts',
  selectedAlertId: null,
  setTab: (tab) => set({ tab }),
  focusAlert: (id) => set({ selectedAlertId: id, tab: 'map' }),
}));
