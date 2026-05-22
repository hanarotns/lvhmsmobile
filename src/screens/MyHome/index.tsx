import React from 'react';

import 'dayjs/locale/ko';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import MYH010101 from './MYH010101';
import WRK010101 from './WRK010101';

const Home = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  return loginInfo?.isPreHire ? <WRK010101 /> : <MYH010101 />;
};
export default Home;
