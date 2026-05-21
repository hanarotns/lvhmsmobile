import { create } from 'zustand';

type EmpState = {
  empInfo: any;
  setEmpInfo: (empInfo: any) => void;
};

export const useEmpStore = create<EmpState>((set) => ({
  empInfo: {},
  setEmpInfo: (empInfo) => set({ empInfo }),
}));
