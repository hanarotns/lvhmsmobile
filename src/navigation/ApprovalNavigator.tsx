import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import APR010101 from '../screens/Approval/APR010101';
import type { ApprovalStackParamList } from './types';

const Stack = createNativeStackNavigator<ApprovalStackParamList>();

export default function ApprovalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='APR010101'
        component={APR010101}
        options={{ title: '결재 현황' }}
      />
    </Stack.Navigator>
  );
}
