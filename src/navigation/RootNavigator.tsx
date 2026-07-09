import React from 'react';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { LVLoadingIndicator } from '../components';
import { Fetch, Util } from '../lib';
import { HomeNavigator } from './HomeNavigator';
import SignInNavigator from './SignInNavigator';

export default function RootNavigator() {
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const [loading, setLoading] = React.useState(true);

  const isLoggedIn = !Util.isEmpty(sessionInfo);

  React.useLayoutEffect(() => {
    const setStorageValue = async (field) => {
      let value = await AsyncStorage.getItem(field);
      if (field == 'autoLogin' && value == null) {
        value = 'true';
      }
      if (field == 'isRememberLogin' && value == null) {
        value = 'true';
      }
      if (field == 'isPreHire' && value == null) {
        value = 'false';
      }
      return value;
    };
    setStorageValue('loginId').then((value) => {
      const loginId = value;
      setStorageValue('loginPwd').then((value) => {
        const loginPwd = value;
        setStorageValue('autoLogin').then((value) => {
          const autoLogin = value;
          setStorageValue('isRememberLogin').then((value) => {
            const isRememberLogin = JSON.parse(value);
            setStorageValue('isPreHire').then((value) => {
              const isPreHire = JSON.parse(value);
              setLoginInfo({
                ...loginInfo,
                ...{ loginId, loginPwd, autoLogin, isRememberLogin, isPreHire },
              });
            });
          });
        });
      });
    });
    setLoading(true);
    Fetch.preCheckSignIn().then(async (result) => {
      if (result && loginInfo.autoLogin === 'true') {
        setSessionInfo(result);
      } else {
        AsyncStorage.removeItem('password');
      }
      setLoading(false);
      // SplashScreen.hide();
      // Util.initLocation(setGeo);
    });
  }, []);

  return loading ? (
    <LVLoadingIndicator
      styleIndicator={{ backgroundColor: '#28304C' }}
      styleLoading={{ borderColor: '#ffffff' }}
    />
  ) : (
    <NavigationContainer>
      {isLoggedIn ? <HomeNavigator /> : <SignInNavigator />}
    </NavigationContainer>
  );
}
