import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SignIn from '../screens/SignIn';
import SGN010101 from '../screens/SignIn/SGN010101';
import SGN010201 from '../screens/SignIn/SGN010201';
import SGN030101 from '../screens/SignIn/SGN030101';
import SGN040101 from '../screens/SignIn/SGN040101';
import type { SignInStackParamList } from './types';

const Stack = createNativeStackNavigator<SignInStackParamList>();

export default function SignInNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='SignIn'
        component={SignIn}
        options={{ title: '로그인', headerShown: false }}
      />
      <Stack.Screen
        name='SGN010101'
        component={SGN010101}
        options={{ title: '회원가입' }} // 약관동의
      />
      <Stack.Screen
        name='SGN010201'
        component={SGN010201}
        options={{ title: '회원가입' }} // 회원정보입력
      />
      <Stack.Screen
        name='SGN030101'
        component={SGN030101}
        options={{ title: '비밀번호 찾기' }}
      />
      <Stack.Screen
        name='SGN040101'
        component={SGN040101}
        options={{ title: '2차 인증' }}
      />
    </Stack.Navigator>
  );
}
