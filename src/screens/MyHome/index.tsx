import React from 'react';
import 'dayjs/locale/ko';

import {AppStore} from '~/store';
import {useRecoilState} from 'recoil';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import MYH010101 from './MYH010101';
import WRK010101 from './WRK010101';

const Home = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const [loginInfo, setLoginInfo] = useRecoilState(AppStore.loginInfoState);

  return loginInfo?.isPreHire ? <WRK010101 /> : <MYH010101 />;
};
export default Home;
