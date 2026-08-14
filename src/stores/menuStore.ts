import { create } from 'zustand';

type MenuState = {
  menuInfo: any;
  setMenuInfo: (menuInfo: any) => void;
};

export const useMenuStore = create<MenuState>((set) => ({
  menuInfo: {},
  setMenuInfo: (menuInfo) => set({ menuInfo }),
}));
