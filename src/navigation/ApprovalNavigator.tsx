import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ApprovalDetailScreen from '../screens/approval/ApprovalDetailScreen';
import ApprovalMainScreen from '../screens/approval/ApprovalMainScreen';
import type { ApprovalStackParamList } from './types';

const Stack = createNativeStackNavigator<ApprovalStackParamList>();

export default function ApprovalNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='ApprovalMain'
        component={ApprovalMainScreen}
        options={{ title: '결재' }}
      />
      <Stack.Screen
        name='ApprovalDetail'
        component={ApprovalDetailScreen}
        options={{ title: '결재 상세' }}
      />
    </Stack.Navigator>
  );
}
