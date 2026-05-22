import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LEA010101 from '../screens/AnnualLeave/LEA010101';
import LEA010201 from '../screens/AnnualLeave/LEA010201';
import LEA010301 from '../screens/AnnualLeave/LEA010301';
import type { AnnualLeaveStackParamList } from './types';

const Stack = createNativeStackNavigator<AnnualLeaveStackParamList>();

export default function AnnualLeaveNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='LEA010101'
        component={LEA010101}
        options={{ title: '휴가 현황' }}
      />
      <Stack.Screen
        name='LEA010201'
        component={LEA010201}
        options={{ title: '휴가 신청하기' }}
      />
      <Stack.Screen
        name='LEA010301'
        component={LEA010301}
        options={{ title: '휴가 현황 상세' }}
      />
    </Stack.Navigator>
  );
}
