import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVButton,
  LVColors,
  LVLoadingIndicator,
  LVStyles,
  Text,
  TextField,
} from '@/src/components';
import { Fetch, Util } from '@/src/lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Action from './Action';

const SecondAuthScreen = (props) => {
  const { setIsSecondAuthScreen } = props;

  const isFocused = useIsFocused();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    USER_ID: '',
    USER_NAME_LOC: '',
    USER_CP: '',
  });
  const [authNo, setAuthNo] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [sendDateTime, setSendDateTime] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);
  const mount = async () => {
    try {
      setLoading(true);
      if (!sessionInfo?.USER_CP) {
        Alert.alert(
          '알림',
          '등록된 휴대폰 번호가 없습니다.\n관리자에게 문의하세요.',
        );
        return;
      }
      setUserInfo({
        USER_ID: sessionInfo?.USER_ID || '',
        USER_NAME_LOC: sessionInfo?.USER_NAME_LOC || '',
        USER_CP: '',
      });
    } catch (e) {
      Alert.alert('알림', '사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onPressSendAuthNo = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      const phone = sessionInfo?.USER_CP;
      const onlyNumber = phone.replace(/\D/g, '');
      if (onlyNumber !== userInfo?.USER_CP) {
        console.log(
          '@@ sessionInfo?.USER_CP',
          sessionInfo?.USER_CP,
          userInfo?.USER_CP,
        );
        Alert.alert(
          '알림',
          '계정에 등록된 휴대폰번호와 상이합니다.\n관리자에게 문의하세요.',
        );
        return;
      }
      setSending(true);
      const payload = {
        MOBILE_ID: deviceId,
        PW_CHECK_YN: 'Y',
        USER_ID: userInfo.USER_ID,
        USER_NAME_LOC: userInfo.USER_NAME_LOC,
        USER_CP: userInfo.USER_CP,
        REQ_SCREEN: 'LOGIN',
      };

      const res = await Action.sendSMSForCP(payload);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setIsSmsSent(true);
      setSendDateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      setAuthNo('');
      if (res?.TYPE === 1) {
        Alert.alert('알림', '인증번호를 발송했습니다.');
      }
    } catch (e) {
      console.log('@@ sendAuthNo error', e);
      Alert.alert('알림', '인증번호 발송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  const onPressConfirmAuthNo = async () => {
    if (!authNo) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }

    if (authNo.length < 6) {
      Alert.alert('알림', '인증번호 6자리를 입력해주세요.');
      return;
    }

    try {
      setConfirming(true);
      const deviceId = await AsyncStorage.getItem('deviceId');
      const payload = {
        MOBILE_ID: deviceId,
        USER_CP: userInfo?.USER_CP,
        AUTH_CODE: authNo,
      };
      const res = await Action.checkAuthNumber(payload);
      if (res.TYPE === 1)
        await new Promise((resolve) => setTimeout(resolve, 700)); // @@ 이거 머지...?

      if (res?.AUTH_YN === 'Y') {
        const payload2 = {
          EMP_ID: empInfo?.EMP_ID || '',
          COMPANY_CODE: empInfo?.COMPANY_CODE || '',
          MOBILE_ID: deviceId || '',
        };
        const res = await Action.saveMobileId(payload2);
        if (res.TYPE === 1) {
          Util.toastMsg('인증번호가 확인되었습니다.', 'success');
          setIsSecondAuthScreen(false);
        } else {
          Alert.alert(
            '알림',
            '인증번호 확인과정에서 문제가 발생하였습니다.\n관리자에게 문의하세요.',
          );
        }
      } else {
        Alert.alert('알림', '인증번호가 올바르지 않습니다.');
      }
    } catch (e) {
      Alert.alert('알림', '인증번호 확인 중 오류가 발생하였습니다.');
    } finally {
      setConfirming(false);
    }
  };

  const logout = async () => {
    Fetch.logout().then((result) => {
      if (result) {
        setSessionInfo(null);
        setEmpInfo(null);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contents}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={180}
        >
          <View>
            <Text style={styles.title}>2차 인증</Text>
            <Text style={styles.desc}>
              {`로그인 보호를 위해\n등록된 휴대폰 번호로 본인 확인을 진행합니다.`}
            </Text>
            <View style={styles.infoBox}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>휴대폰 번호</Text>
              </View>
              <View style={[LVStyles.row, styles.inlineRow]}>
                <TextField
                  // disabled={isPhoneAuthRequested}
                  keyboardType='numeric'
                  placeholder='ex. 01012345678'
                  maxLength={11}
                  placeholderTextColor='lightgray'
                  style={[styles.textFieldSt, styles.inlineInput]}
                  autoCapitalize='none'
                  onChangeValue={(value: string) => {
                    setUserInfo((prev) => ({
                      ...prev,
                      USER_CP: value,
                    }));
                  }}
                  // onBlur={() => handleBlurField('phoneNumber')}
                  // value={memberInfo.phoneNumber}
                />
                <LVButton
                  title={sending ? '발송 중...' : '인증요청'}
                  onPress={onPressSendAuthNo}
                  buttonStyle={styles.button}
                  textStyle={{
                    color: '#27A7FF',
                  }}
                />
              </View>
            </View>

            {!isSmsSent ? (
              <>
                {/* <View style={styles.guideBox}>
                <Text style={styles.guideTitle}>
                  위 휴대폰 번호로 인증번호를 발송할까요?
                </Text>
                <Text style={styles.guideText}>
                  발송된 인증번호를 입력하면 로그인이 완료됩니다.
                </Text>
              </View> */}
              </>
            ) : (
              <View style={styles.guideBox}>
                <Text style={styles.guideTitle}>
                  인증번호가 발송되었습니다.
                </Text>
                <Text style={styles.guideText}>
                  문자로 받은 인증번호 6자리를 입력해주세요.
                </Text>
                <Text style={styles.sendTimeText}>
                  발송시간 : {sendDateTime}
                </Text>

                <Input
                  value={authNo}
                  placeholder='인증번호 6자리 입력'
                  keyboardType='number-pad'
                  maxLength={6}
                  onChangeText={(text) => {
                    const onlyNumber = text.replace(/[^0-9]/g, '');
                    setAuthNo(onlyNumber);
                  }}
                  style={styles.input}
                />
              </View>
            )}
          </View>
          {isSmsSent && (
            <>
              <LVButton
                title={confirming ? '확인 중...' : '인증 확인'}
                onPress={onPressConfirmAuthNo}
                buttonStyle={styles.mainButton}
              />
            </>
          )}
        </KeyboardAwareScrollView>
        <View style={styles.floatingButton}>
          <TouchableOpacity onPress={logout} style={styles.menuButton}>
            <Text style={styles.menuText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
      {(loading || sending || confirming) && <LVLoadingIndicator />}
    </View>
  );
};
export default SecondAuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F6',
  },
  contents: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    backgroundColor: '#F0F2F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 28,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    padding: 20,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 16,
  },
  guideBox: {
    borderRadius: 16,
    backgroundColor: '#F7F8FA',
    padding: 20,
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  sendTimeText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
  },
  input: {
    marginTop: 16,
    backgroundColor: '#FFF',
  },
  bottomArea: {
    marginTop: 24,
  },
  mainButton: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F3F4F6',
  },
  subButtonText: {
    color: '#333',
  },
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
  },
  textFieldSt: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderColor: 'lightgray',
    borderRadius: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
    marginBottom: 4,
  },
  label: {
    color: '#373747',
    fontSize: 16,
  },
  inlineRow: {
    marginBottom: 10,
  },
  inlineInput: {
    marginBottom: 0,
    flex: 1,
    marginRight: 8,
  },
  menuButton: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  menuText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
    color: LVColors.primary,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 32,
  },
});
