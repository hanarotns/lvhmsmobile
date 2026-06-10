import { create } from 'zustand';

interface RefreshStore {
  leaveRefresh: boolean;
  setLeaveRefresh: (value: boolean) => void;
}

export const useRefreshStore = create<RefreshStore>((set) => ({
  leaveRefresh: false,
  setLeaveRefresh: (value) => set({ leaveRefresh: value }),
}));
