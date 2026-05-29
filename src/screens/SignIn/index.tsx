import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as icon from '@/src/assets/images';
import {
  KeyboardAwareScrollView,
  LVButton,
  LVCheckBox,
  LVLoadingIndicator,
  LVModal,
  LVRadioButton,
  LVStyles,
  SafeAreaView,
  ShowPasswordIcon,
  Terms,
  Text,
  TextField,
} from '@/src/components';
import { Util } from '@/src/lib';
import env from '@/src/lib/env';
import { useNavigation } from '@react-navigation/native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Action from './Action';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
const fetchQaURL = envConfig.fetchQaURL;

const SignIn = ({ navigation }) => {
  const movingScreen = useNavigation();
  const [loading, setLoading] = useState(true);

  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const [url, setUrl] = useState(fetchURL);
  const [urlFinal, setUrlFinal] = useState(fetchURL);

  const [visiblePwd, setVisiblePwd] = useState(false);
  const [visibleTerms, setVisibleTerms] = useState(false);
  const [visibleServerChange, setVisibleServerChange] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 비동기 실행
  useEffect(() => {
    setLoading(false);
    mount();
  }, []);

  const mount = async () => {
    await AsyncStorage.setItem('url', fetchURL);
    const deviceInfo = {
      deviceId:
        Platform.OS === 'android'
          ? Application.getAndroidId()
          : await Application.getIosIdForVendorAsync(),

      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
    };
    const setStorageValue = async (field) => {
      let value = await AsyncStorage.getItem(field);
      if (field == 'autoLogin' && value == null) {
        value = 'true';
      }
      return value;
    };
    setStorageValue('loginId').then((value) => {
      const loginId = value;
      setStorageValue('loginPwd').then((value) => {
        const loginPwd = value;
        setStorageValue('autoLogin').then((value) => {
          const autoLogin = value;
          setStorageValue('isRememberLogin').then((value) => {
            console.log('@@ isRememberLogin value', value);
            const isRememberLogin = JSON.parse(value);
            setStorageValue('isPreHire').then((value) => {
              const isPreHire = JSON.parse(value);
              setLoginInfo({
                ...loginInfo,
                ...{ loginId, loginPwd, autoLogin, isRememberLogin, isPreHire },
              });
            });
          });
        });
      });
    });
    console.log(deviceInfo);
  };

  const signIn = () => {
    // 비즈니스 체크로직
    if (!loginInfo.loginId) {
      Util.toastMsg('아이디를 입력해주세요.', 'info');
      return;
    }
    if (!loginInfo.loginPwd) {
      Util.toastMsg('비밀번호를 입력해주세요.', 'info');
      return;
    }

    setLoading(true);

    Action.signIn(loginInfo).then((data) => {
      if (data) {
        setSessionInfo(data.session);
        // 로그인 id, pwd 지우기
        if (!loginInfo?.isRememberLogin) {
          setLoginInfo({ ...loginInfo, ...{ loginId: '', loginPwd: '' } });
          AsyncStorage.setItem('loginId', '');
          AsyncStorage.setItem('loginPwd', '');
        }
      }
      if (data?.code !== 200) {
        setLoginError(data?.serviceResponseCode?.message);
      }
      setLoading(false);
    });
    return null;
  };

  const onChangeValue = (value, field) => {
    setLoginInfo({ ...loginInfo, ...{ [field]: value } });
  };

  const onConfirm = () => {
    setVisibleTerms(!visibleTerms);
  };

  const handleChange = async () => {
    setUrlFinal(url);
    await AsyncStorage.setItem('url', url);
    setVisibleServerChange(!visibleServerChange);
  };

  return loading ? (
    <LVLoadingIndicator />
  ) : (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps='handled'
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View style={{ height: 158 }} />
        <TouchableOpacity
          onPress={() => {
            setVisibleServerChange(true);
          }}
        >
          {urlFinal === fetchURL ? (
            <Image
              source={icon.ico_logo_lvhms}
              resizeMode={'contain'}
              style={styles.logobox}
            />
          ) : (
            <Image
              source={icon.ico_logo_lvhms_beta}
              resizeMode={'contain'}
              style={styles.logobox}
            />
          )}
        </TouchableOpacity>
        <View style={styles.container}>
          <TextField
            placeholder='아이디'
            placeholderTextColor='#999FA8'
            style={styles.textFieldSt}
            autoCapitalize={'none'}
            onChangeValue={(value) => onChangeValue(value, 'loginId')}
            value={loginInfo.loginId}
          />
          <TextField
            placeholder='비밀번호'
            placeholderTextColor='#999FA8'
            style={styles.textFieldSt}
            autoCapitalize={'none'}
            onChangeValue={(value) => onChangeValue(value, 'loginPwd')}
            secureTextEntry={!visiblePwd}
            value={loginInfo.loginPwd}
            accessoryRight={
              <ShowPasswordIcon
                color={'black'}
                visiblePwd={visiblePwd}
                setVisible={setVisiblePwd}
              />
            }
          />
          <View style={styles.subContainer}>
            <LVCheckBox
              label='간편로그인'
              value={loginInfo.isRememberLogin}
              onChange={(value) => onChangeValue(value, 'isRememberLogin')}
            />
            <LVCheckBox
              label='입사지원'
              value={loginInfo.isPreHire}
              onChange={(value) => onChangeValue(value, 'isPreHire')}
            />
          </View>
          <LVButton
            title={'로그인'}
            onPress={signIn}
            buttonStyle={{ backgroundColor: '#27A7FF' }}
          />
          <View style={[LVStyles.row]}>
            <LVButton
              title={'비밀번호 찾기'}
              onPress={() => {
                movingScreen.navigate('SGN030101');
              }}
              textStyle={{ color: 'gray', fontWeight: '400' }}
              buttonStyle={{
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
              }}
            />
            <LVButton
              title={'회원가입'}
              onPress={() => {
                movingScreen.navigate('SGN010101');
              }}
              textStyle={{ color: 'gray', fontWeight: '400' }}
              buttonStyle={{
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
              }}
            />
          </View>
          <Text style={[styles.errorText]}>{loginError}</Text>
          <TouchableOpacity onPress={onConfirm} style={styles.terms}>
            <Text>이용약관/개인정보 확인</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {visibleTerms && Terms({ onConfirm })}
      {visibleServerChange && (
        <LVModal
          title={'서버 변경'}
          titleIcon={icon.ico_warning}
          contents={
            <ServerChangeModal
              value={url}
              onChange={(e) => {
                setUrl(e);
              }}
            />
          }
          onVisible={ServerChangeModal}
          onOk={handleChange}
        />
      )}
    </SafeAreaView>
  );
};
export default SignIn;

const ServerChangeModal = (props: any) => {
  const { value, onChange } = props;
  return (
    <View>
      <LVRadioButton
        title='운영'
        gubun={value === fetchURL}
        onPress={() => {
          onChange(fetchURL);
        }}
      />
      <View style={{ height: 8 }} />
      <LVRadioButton
        title='QA'
        gubun={value === fetchQaURL}
        onPress={() => {
          onChange(fetchQaURL);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#F0F2F6',
  },
  autoLogin: {
    marginRight: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
    marginTop: 15,
  },
  indicator: {
    flex: 1,
    backgroundColor: '#28304C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 2.5,
    height: 50,
    width: 100,
  },
  buttonBox: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logobox: {
    width: 197,
    height: 59,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginbox: {
    padding: 5,
  },
  container: {
    margin: 50,
    padding: 5,
    flex: 1,
    flexDirection: 'column',
  },
  subContainer: {
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  textFieldSt: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#27A7FF17',
    borderColor: '#27A7FF',
    borderRadius: 8,
  },
  inputIdContainer: {
    width: '70%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonLogin: {
    width: '100%',
    height: 50,
    backgroundColor: '#27A7FF',
    // bluecolor.basicWhiteColorTrans,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    // bluecolor.basicBlueFontColor,
    fontWeight: 'bold',
  },
  terms: {
    alignItems: 'center',
    marginTop: 200,
    justifyContent: 'flex-end',
  },
  errorText: {
    color: '#FF9294',
    fontWeight: '800',
    fontSize: 20,
    height: 30,
  },
});
