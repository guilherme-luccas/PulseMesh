import { create } from 'zustand';

export type AppTab = 'alerts' | 'map';

interface MapFocusState {
  tab: AppTab;
  selectedAlertId: string | null;
  topicAlertId: string | null;
  setTab: (tab: AppTab) => void;
  focusAlert: (id: string) => void;
  openTopic: (id: string) => void;
  closeTopic: () => void;
}

export const useMapFocusStore = create<MapFocusState>()((set) => ({
  tab: 'alerts',
  selectedAlertId: null,
  topicAlertId: null,
  setTab: (tab) => set({ tab, topicAlertId: null }),
  focusAlert: (id) => set({ selectedAlertId: id, tab: 'map', topicAlertId: null }),
  openTopic: (id) => set({ topicAlertId: id }),
  closeTopic: () => set({ topicAlertId: null }),
}));
