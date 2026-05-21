import { create } from 'zustand';

type SessionState = {
  sessionInfo: any;
  setSessionInfo: (sessionInfo: any) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionInfo: {},
  setSessionInfo: (sessionInfo) => set({ sessionInfo }),
}));
