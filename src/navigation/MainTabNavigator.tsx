import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MYH010101 from '../screens/MyHome/MYH010101';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tab.Screen name='Home' component={MYH010101} options={{ title: '홈' }} />
    </Tab.Navigator>
  );
}
