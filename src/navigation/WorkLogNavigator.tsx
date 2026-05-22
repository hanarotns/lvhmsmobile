import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import WLO010101 from '../screens/WorkLog/WLO010101';
import type { WorkLogStackParamList } from './types';

const Stack = createNativeStackNavigator<WorkLogStackParamList>();

export default function WorkLogNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='WLO010101'
        component={WLO010101}
        options={{ title: '캘린더' }}
      />
    </Stack.Navigator>
  );
}
