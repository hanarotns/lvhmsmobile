import { useSessionStore } from '@/src/stores/sessionStore';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Util } from '../lib';
import MainTabNavigator from './MainTabNavigator';
import SignInNavigator from './SignInNavigator';

export default function RootNavigator() {
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const isLoggedIn = !Util.isEmpty(sessionInfo);
  return (
    <NavigationContainer>
      {isLoggedIn ? <MainTabNavigator /> : <SignInNavigator />}
    </NavigationContainer>
  );
}
