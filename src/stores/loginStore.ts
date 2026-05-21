import { create } from 'zustand';

type LoginState = {
  loginInfo: any;
  setLoginInfo: (loginInfo: any) => void;
};

export const useLoginStore = create<LoginState>((set) => ({
  loginInfo: {
    loginId: '',
    loginPwd: '',
    autoLogin: 'true',
    isRememberLogin: true,
    isPreHire: false,
    // deleteId: null,
  },
  setLoginInfo: (loginInfo) => set({ loginInfo }),
}));
