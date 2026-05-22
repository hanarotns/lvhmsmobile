import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import PAL010101 from '../screens/PersonalApprovalLine/PAL010101';
import PAL010201 from '../screens/PersonalApprovalLine/PAL010201';
import PAL010301 from '../screens/PersonalApprovalLine/PAL010301';
import type { PersonalApprovalLineStackParamList } from './types';

const Stack = createNativeStackNavigator<PersonalApprovalLineStackParamList>();

export default function PersonalApprovalLineNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='PAL010101'
        component={PAL010101}
        options={{ title: '개인별 결재선 관리' }}
      />
      <Stack.Screen
        name='PAL010201'
        component={PAL010201}
        options={{ title: '개인별 결재선 생성' }}
      />
      <Stack.Screen
        name='PAL010301'
        component={PAL010301}
        options={{ title: '개인별 결재선 상세' }}
      />
    </Stack.Navigator>
  );
}
