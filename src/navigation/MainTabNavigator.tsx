import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import HomeScreen from '../screens/home/HomeScreen';
import ApprovalNavigator from './ApprovalNavigator';
import AttendanceNavigator from './AttendanceNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen
        name='Attendance'
        component={AttendanceNavigator}
        options={{ title: '근태' }}
      />
      <Tab.Screen
        name='Approval'
        component={ApprovalNavigator}
        options={{ title: '결재' }}
      />
    </Tab.Navigator>
  );
}
