import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import Home from '../screens/MyHome';
import WRK010101 from '../screens/MyHome/WRK010101';
import WRK010201 from '../screens/MyHome/WRK010201';

// 기타 (설정)
import ETC010101 from '../screens/Etc/ETC010101';
import ETC010201 from '../screens/Etc/ETC010201';
import ETC010301 from '../screens/Etc/ETC010301';
import ETC010401 from '../screens/Etc/ETC010401';
import ETC010402 from '../screens/Etc/ETC010402';
import ETC010403 from '../screens/Etc/ETC010403';
// 근태
import WLO010101 from '../screens/WorkLog/WLO010101';
// 휴가
import LEA010101 from '../screens/AnnualLeave/LEA010101';
import LEA010201 from '../screens/AnnualLeave/LEA010201';
import LEA010202 from '../screens/AnnualLeave/LEA010202';
import LEA010301 from '../screens/AnnualLeave/LEA010301';
import LEA020101 from '../screens/AnnualLeave/LEA020101';
import LEA020201 from '../screens/AnnualLeave/LEA020201';
import LEA020301 from '../screens/AnnualLeave/LEA020301';
// 시간외
import OVT010101 from '../screens/Overtime/OVT010101';
import OVT010201 from '../screens/Overtime/OVT010201';
import OVT010202 from '../screens/Overtime/OVT010202';
import OVT010301 from '../screens/Overtime/OVT010301';
// 결재
import APR010101 from '../screens/Approval/APR010101';
// 급여
import ACC010101 from '../screens/Account/ACC010101';
import ACC010201 from '../screens/Account/ACC010201';
// 개인별 결재선 관리
import LVHeaderInfo from '../components/LVHeaderInfo';
import PAL010101 from '../screens/PersonalApprovalLine/PAL010101';
import PAL010201 from '../screens/PersonalApprovalLine/PAL010201';
import PAL010301 from '../screens/PersonalApprovalLine/PAL010301';

// import ImageBox from '../components/ImageBox';
// import ImageView from '../components/ImageView';
// import PhotoList from '../components/PhotoList';

const Stack = createStackNavigator();

export const HomeNavigator = (props) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerRight: () => <LVHeaderInfo />,
    }}
  >
    <Stack.Screen
      name='Home'
      component={Home}
      options={{ title: '마이홈', headerShown: false }}
    />
    <Stack.Screen
      name='WRK010101'
      component={WRK010101}
      options={{ title: '근무현황', headerShown: false }}
    />
    <Stack.Screen
      name='WRK010201'
      component={WRK010201}
      options={{ title: '입사지원' }}
    />
    <Stack.Screen
      name='ETC010101'
      component={ETC010101}
      options={{ title: '설정' }}
    />
    <Stack.Screen
      name='ETC010201'
      component={ETC010201}
      options={{ title: '마이 페이지' }}
    />
    <Stack.Screen
      name='ETC010301'
      component={ETC010301}
      options={{ title: '비밀번호 변경' }}
    />
    <Stack.Screen
      name='ETC010401'
      component={ETC010401}
      options={{ title: '증명서 현황' }}
    />
    <Stack.Screen
      name='ETC010402'
      component={ETC010402}
      options={{ title: '증명서 신청하기' }}
    />
    <Stack.Screen
      name='ETC010403'
      component={ETC010403}
      options={{ title: '증명서 현황 상세' }}
    />
    <Stack.Screen
      name='WLO010101'
      component={WLO010101}
      options={{ title: '캘린더' }}
    />
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
      name='LEA010202'
      component={LEA010202}
      options={{ title: '휴가 변경취소하기' }}
    />
    <Stack.Screen
      name='LEA010301'
      component={LEA010301}
      options={{ title: '휴가 현황 상세' }}
    />
    <Stack.Screen
      name='LEA020101'
      component={LEA020101}
      options={{ title: '연차사용예정 현황' }}
    />
    <Stack.Screen
      name='LEA020201'
      component={LEA020201}
      options={{ title: '연차사용예정 신청하기' }}
    />
    <Stack.Screen
      name='LEA020301'
      component={LEA020301}
      options={{ title: '연차사용예정 현황 상세' }}
    />
    <Stack.Screen
      name='OVT010101'
      component={OVT010101}
      options={{ title: '시간외 현황' }}
    />
    <Stack.Screen
      name='OVT010201'
      component={OVT010201}
      options={{ title: '시간외 예정 신청하기' }}
    />
    <Stack.Screen
      name='OVT010202'
      component={OVT010202}
      options={{ title: '시간외 확정 신청하기' }}
    />
    <Stack.Screen
      name='OVT010301'
      component={OVT010301}
      options={{ title: '시간외 현황 상세' }}
    />
    <Stack.Screen
      name='APR010101'
      component={APR010101}
      options={{ title: '결재 현황' }}
    />
    <Stack.Screen
      name='ACC010101'
      component={ACC010101}
      options={{ title: '급여 조회 인증' }}
    />
    <Stack.Screen
      name='ACC010201'
      component={ACC010201}
      options={{ title: '급여 조회' }}
    />
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
    {/* <Stack.Screen name='Photo' component={ImageBox} />
    <Stack.Screen name='PhotoList' component={PhotoList} />
    <Stack.Screen name='ImageView' component={ImageView} /> */}
  </Stack.Navigator>
);
