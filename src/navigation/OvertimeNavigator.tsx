import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OVT010101 from '../screens/Overtime/OVT010101';
import OVT010201 from '../screens/Overtime/OVT010201';
import OVT010202 from '../screens/Overtime/OVT010202';
import OVT010301 from '../screens/Overtime/OVT010301';
import type { OvertimeStackParamList } from './types';

const Stack = createNativeStackNavigator<OvertimeStackParamList>();

export default function OvertimeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='OVT010101'
        component={OVT010101}
        options={{ title: '시간외 현황' }}
      />
      <Stack.Screen
        name='OVT010201'
        component={OVT010201}
        options={{ title: '시간외 예정 신청하기' }}
      />
      <Stack.Screen
        name='OVT010202'
        component={OVT010202}
        options={{ title: '시간외 확정 신청하기' }}
      />
      <Stack.Screen
        name='OVT010301'
        component={OVT010301}
        options={{ title: '시간외 현황 상세' }}
      />
    </Stack.Navigator>
  );
}
