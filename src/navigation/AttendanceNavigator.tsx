import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AttendanceDetailScreen from '../screens/attendance/AttendanceDetailScreen';
import AttendanceMainScreen from '../screens/attendance/AttendanceMainScreen';
import type { AttendanceStackParamList } from './types';

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

export default function AttendanceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='AttendanceMain'
        component={AttendanceMainScreen}
        options={{ title: '근태' }}
      />
      <Stack.Screen
        name='AttendanceDetail'
        component={AttendanceDetailScreen}
        options={{ title: '근태 상세' }}
      />
    </Stack.Navigator>
  );
}
