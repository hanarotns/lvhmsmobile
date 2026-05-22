import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ETC010101 from '../screens/Etc/ETC010101';
import ETC010201 from '../screens/Etc/ETC010201';
import ETC010301 from '../screens/Etc/ETC010301';
import type { EtcStackParamList } from './types';

const Stack = createNativeStackNavigator<EtcStackParamList>();

export default function EtcNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='ETC010101'
        component={ETC010101}
        options={{ title: '설정' }}
      />
      <Stack.Screen
        name='ETC010201'
        component={ETC010201}
        options={{ title: '마이 페이지' }}
      />
      <Stack.Screen
        name='ETC010301'
        component={ETC010301}
        options={{ title: '비밀번호 변경' }}
      />
    </Stack.Navigator>
  );
}
