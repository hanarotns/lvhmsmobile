import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LVButton, ShowPasswordIcon, Text, TextField } from '@/src/components';
import { Util } from '@/src/lib';
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import 'dayjs/locale/ko';

const ACC010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [password, setPassword] = useState('');
  const [visiblePwd, setVisiblePwd] = useState(false);

  const handleSubmit = () => {
    AsyncStorage.getItem('loginPwd').then((p) => {
      if (password === p) {
        movingScreen.dispatch(StackActions.replace('ACC010201'));
      } else {
        Util.toastMsg('비밀번호가 일치하지 않습니다.', 'info');
      }
    });
  };

  return (
    <View style={styles.basicView}>
      <View>
        <Text style={styles.hdText}>
          {`급여리스트 확인을 위한 \n${empInfo?.EMP_NAME_LC}님의 비밀번호를 인증하세요`}
        </Text>
        <View style={{ height: 16 }} />
        <TextField
          placeholder='비밀번호를 입력하세요'
          placeholderTextColor='#999FA8'
          style={styles.textFieldSt}
          autoCapitalize={'none'}
          secureTextEntry={!visiblePwd}
          onChangeValue={(value) => setPassword(value)}
          accessoryRight={
            <ShowPasswordIcon
              color='black'
              visiblePwd={visiblePwd}
              setVisible={setVisiblePwd}
            />
          }
          value={password}
        />
        <LVButton title={'확인'} onPress={handleSubmit} />
      </View>
    </View>
  );
};
export default ACC010101;

const styles = StyleSheet.create({
  basicView: {
    backgroundColor: '#FFF',
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  hdText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  textFieldSt: {
    width: '100%',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
});
