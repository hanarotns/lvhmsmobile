import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ACC010101 from '../screens/Account/ACC010101';
import ACC010201 from '../screens/Account/ACC010201';
import type { AccountStackParamList } from './types';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='ACC010101'
        component={ACC010101}
        options={{ title: '급여 조회 인증' }}
      />
      <Stack.Screen
        name='ACC010201'
        component={ACC010201}
        options={{ title: '급여 조회' }}
      />
    </Stack.Navigator>
  );
}
