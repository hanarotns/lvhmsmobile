import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MYH010101 from '../screens/MyHome/MYH010101';
import AccountNavigator from './AccountNavigator';
import AnnualLeaveNavigator from './AnnualLeaveNavigator';
import ApprovalNavigator from './ApprovalNavigator';
import EtcNavigator from './EtcNavigator';
import OvertimeNavigator from './OvertimeNavigator';
import PersonalApprovalLineNavigator from './PersonalApprovalLineNavigator';
import type { MainTabParamList } from './types';
import WorkLogNavigator from './WorkLogNavigator';

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
      <Tab.Screen name='Home' component={MYH010101} />
      <Tab.Screen name='WorkLog' component={WorkLogNavigator} />
      <Tab.Screen name='AnnualLeave' component={AnnualLeaveNavigator} />
      <Tab.Screen name='Overtime' component={OvertimeNavigator} />
      <Tab.Screen name='Approval' component={ApprovalNavigator} />
      <Tab.Screen name='Account' component={AccountNavigator} />
      <Tab.Screen name='Etc' component={EtcNavigator} />
      <Tab.Screen
        name='PersonalApprovalLine'
        component={PersonalApprovalLineNavigator}
      />
    </Tab.Navigator>
  );
}
