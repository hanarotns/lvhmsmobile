import {
  LVButton,
  LVLoadingIndicator,
  SafeAreaView,
  Text,
} from '@/src/components';
import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useIsFocused } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import React, { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

const SGN040101 = () => {
  const isFocused = useIsFocused();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);

  const [userInfo, setUserInfo] = useState({
    userId: '',
    userName: '',
    mobileNo: '',
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

      // 로그인 직후 전달받은 사용자 정보 우선 사용
      const paramUserInfo = route?.params?.userInfo || {};

      // 필요 시 세션값 사용
      const nextUserInfo = {
        userId: paramUserInfo.userId || session?.USER_ID || '',
        userName: paramUserInfo.userName || session?.USER_NAME || '',
        mobileNo: paramUserInfo.mobileNo || session?.USER_CP || '',
      };

      // 필요하면 여기서 사용자 상세 조회 API 추가 가능
      // const res = await Action.getUserInfo({...});
      // nextUserInfo.mobileNo = res?.mobileNo || nextUserInfo.mobileNo;

      setUserInfo(nextUserInfo);
    } catch (e) {
      console.log('@@ mount error', e);
      Alert.alert('알림', '사용자 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getMaskedPhoneNo = (mobileNo: string) => {
    if (!mobileNo) {
      return '';
    }

    const onlyNumber = String(mobileNo).replace(/[^0-9]/g, '');

    if (onlyNumber.length === 11) {
      return `${onlyNumber.substring(0, 3)}-${onlyNumber.substring(
        3,
        7,
      )}-${onlyNumber.substring(7, 11)}`;
    }

    if (onlyNumber.length === 10) {
      return `${onlyNumber.substring(0, 3)}-${onlyNumber.substring(
        3,
        6,
      )}-${onlyNumber.substring(6, 10)}`;
    }

    return mobileNo;
  };

  const onPressSendAuthNo = () => {
    // if (!userInfo.mobileNo) {
    //   Alert.alert('알림', '등록된 휴대폰 번호가 없습니다.');
    //   return;
    // }

    Alert.alert(
      '2차 인증',
      `계정에 등록된 휴대폰 번호\n${getMaskedPhoneNo(
        userInfo.mobileNo,
      )}\n로 인증번호를 발송하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '발송',
          onPress: () => {
            sendAuthNo();
          },
        },
      ],
    );
  };

  const sendAuthNo = async () => {
    try {
      setSending(true);

      const sParam = {
        userId: userInfo.userId,
        mobileNo: userInfo.mobileNo,
        authType: 'LOGIN',
      };

      // 실제 API 예시
      // const res = await Action.sendLoginAuthNo(sParam);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setIsSmsSent(true);
      setSendDateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      setAuthNo('');

      Alert.alert('알림', '인증번호를 발송했습니다.');
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

      const sParam = {
        userId: userInfo.userId,
        authNo: authNo,
        authType: 'LOGIN',
      };

      // 실제 API 예시
      // const res = await Action.confirmLoginAuthNo(sParam);

      await new Promise((resolve) => setTimeout(resolve, 700));

      Alert.alert('인증 완료', '2차 인증이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.replace('Home');
          },
        },
      ]);
    } catch (e) {
      console.log('@@ onPressConfirmAuthNo error', e);
      Alert.alert('알림', '인증번호가 올바르지 않습니다.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.contents}>
          <View>
            <Text style={styles.title}>2차 인증</Text>
            <Text style={styles.desc}>
              로그인 보호를 위해{'\n'}
              등록된 휴대폰 번호로 본인 확인을 진행합니다.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{userInfo.userName || '-'}</Text>

              <View style={styles.divider} />

              <Text style={styles.infoLabel}>휴대폰 번호</Text>
              <Text style={styles.infoValue}>
                {getMaskedPhoneNo(userInfo.mobileNo) || '-'}
              </Text>
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

          <View style={styles.bottomArea}>
            {!isSmsSent ? (
              <LVButton
                title={sending ? '발송 중...' : '인증번호 발송'}
                onPress={onPressSendAuthNo}
                buttonStyle={styles.mainButton}
              />
            ) : (
              <>
                <LVButton
                  title={confirming ? '확인 중...' : '인증 확인'}
                  onPress={onPressConfirmAuthNo}
                  buttonStyle={styles.mainButton}
                />
                <LVButton
                  title={sending ? '재발송 중...' : '인증번호 재발송'}
                  onPress={onPressSendAuthNo}
                  buttonStyle={styles.subButton}
                  textStyle={styles.subButtonText}
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>

      {(loading || sending || confirming) && <LVLoadingIndicator />}
    </View>
  );
};
export default SGN040101;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contents: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    backgroundColor: '#FFF',
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
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
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
    height: 52,
    borderRadius: 12,
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
});
