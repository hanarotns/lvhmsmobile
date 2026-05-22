import React, {useEffect, useState, useRef} from 'react';
import {View, Image, StyleSheet, Platform, ImageBackground} from 'react-native';
import {
  ScrollView,
  RefreshControl,
  LVButton,
  Text,
  TextField,
  ShowPasswordIcon,
} from '~/component'; // 공통컴포넌트
import 'dayjs/locale/ko';
import {Util} from '~/lib';

import {AppStore} from '~/store';
import {useRecoilState} from 'recoil';
import {
  StackActions,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';

import AsyncStorage from '@react-native-community/async-storage';

const ACC010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const [session, setSession] = useRecoilState(AppStore.sessionState);
  const [empInfo, setEmpInfo] = useRecoilState(AppStore.empInfoState);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [isCertify, setIsCertify] = useState(false);
  const [memberInfo, setMemberInfo] = useState({});
  const [password, setPassword] = useState('');
  const [visiblePwd, setVisiblePwd] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(true);
    // @@ 인증 관련해서 API 추가될 수 있음.
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const handleSubmit = () => {
    AsyncStorage.getItem('loginPwd').then(p => {
      if (password === p) {
        movingScreen.dispatch(StackActions.replace('ACC010201'));
      } else {
        Util.toastMsg('비밀번호가 일치하지 않습니다.', 'info');
      }
    });
  };

  return isCertify ? (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }></ScrollView>
    </View>
  ) : (
    <View style={styles.basicView}>
      <View>
        <Text style={styles.hdText}>
          {`급여리스트 확인을 위한 \n${empInfo?.EMP_NAME_LC}님의 비밀번호를 인증하세요`}
        </Text>
        <View style={{height: 16}} />
        <TextField
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#999FA8"
          style={styles.textFieldSt}
          autoCapitalize={'none'}
          secureTextEntry={!visiblePwd}
          onChangeValue={value => setPassword(value)}
          accessoryRight={
            <ShowPasswordIcon
              fill={'black'}
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
