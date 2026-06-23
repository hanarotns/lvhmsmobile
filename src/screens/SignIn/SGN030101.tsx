import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVButton,
  LVLoadingIndicator,
  LVStyles,
  SafeAreaView,
  Text,
  TextField,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused } from '@react-navigation/native';
import * as Action from './Action';

type MemberInfo = {
  id: string;
  name: string;
  phoneNumber: string;
  authCode: string;
  pw: string;
  pwChk: string;
};

type ValidationErrors = Partial<Record<keyof MemberInfo, string>>;
type TouchedFields = Partial<Record<keyof MemberInfo, boolean>>;

const idRegex = /^[a-z][a-z0-9]{4,19}$/;
const phoneRegex = /^01[0-9]\d{7,8}$/;
const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

const SGN030101 = ({ navigation }) => {
  const isFocused = useIsFocused();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);

  const [visiblePwd, setVisiblePwd] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    id: '',
    name: '',
    phoneNumber: '',
    authCode: '',
    pw: '',
    pwChk: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isPhoneAuthRequested, setIsPhoneAuthRequested] = useState(false);
  const [isPhoneAuthVerified, setIsPhoneAuthVerified] = useState(false);
  const [phoneAuthMessage, setPhoneAuthMessage] = useState('');

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(false);
  };

  const getPwStrength = (value: string) => {
    if (!value) {
      return '';
    }

    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 2) return '약함';
    if (score <= 4) return '보통';
    return '강함';
  };

  const validateField = (
    key: keyof MemberInfo,
    value: string,
    nextMemberInfo?: MemberInfo,
  ) => {
    const target = nextMemberInfo ?? memberInfo;

    switch (key) {
      case 'id':
        if (!value) {
          return '아이디를 입력하세요.';
        }
        return '';

      case 'name':
        if (!value.trim()) {
          return '이름을 입력하세요.';
        }
        return '';

      case 'phoneNumber':
        if (!value) {
          return '휴대폰 번호를 입력하세요.';
        }
        if (!phoneRegex.test(value)) {
          return '휴대폰 번호 형식이 올바르지 않습니다.';
        }
        return '';

      case 'authCode':
        if (!isPhoneAuthRequested) {
          return '';
        }
        if (!value) {
          return '인증번호를 입력하세요.';
        }
        if (value.length !== 6) {
          return '인증번호 6자리를 입력하세요.';
        }
        return '';

      case 'pw':
        if (!isPhoneAuthRequested) {
          return '';
        }
        if (!value) {
          return '새 비밀번호를 입력하세요.';
        }
        if (!pwRegex.test(value)) {
          return '대/소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다.';
        }
        return '';

      case 'pwChk':
        if (!isPhoneAuthRequested) {
          return '';
        }
        if (!value) {
          return '새 비밀번호 확인을 입력하세요.';
        }
        if (value !== target.pw) {
          return '새 비밀번호가 일치하지 않습니다.';
        }
        return '';

      default:
        return '';
    }
  };

  const isPhoneFormatValid = phoneRegex.test(memberInfo.phoneNumber);

  const updateMemberInfo = (key: keyof MemberInfo, value: string) => {
    let nextValue = value;

    if (key === 'id') {
      nextValue = value.trim().toLowerCase();
    }

    if (key === 'phoneNumber' || key === 'authCode') {
      nextValue = value.replace(/[^0-9]/g, '');
    }

    const nextMemberInfo: MemberInfo = {
      ...memberInfo,
      [key]: nextValue,
    };

    if (key === 'phoneNumber') {
      nextMemberInfo.authCode = '';
      nextMemberInfo.pw = '';
      nextMemberInfo.pwChk = '';

      setIsPhoneAuthRequested(false);
      setIsPhoneAuthVerified(false);
      setPhoneAuthMessage('');
    }

    setTouched((prev) => ({
      ...prev,
      [key]: true,
    }));

    setMemberInfo(nextMemberInfo);

    setErrors((prev) => {
      const nextErrors = { ...prev };

      if (touched[key]) {
        nextErrors[key] = validateField(key, nextValue, nextMemberInfo);
      } else {
        nextErrors[key] = '';
      }

      if (key === 'pw' && touched.pwChk) {
        nextErrors.pwChk = validateField(
          'pwChk',
          nextMemberInfo.pwChk,
          nextMemberInfo,
        );
      }

      return nextErrors;
    });
  };

  const handleBlurField = (key: keyof MemberInfo) => {
    setTouched((prev) => ({
      ...prev,
      [key]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, memberInfo[key]),
    }));
  };

  // 휴대폰 인증 레이아웃용 핸들러
  const requestPhoneAuthCode = async () => {
    if (!isPhoneFormatValid) {
      return;
    }

    setTouched((prev) => ({
      ...prev,
      phoneNumber: true,
    }));
    try {
      const payload = {
        OPEN_API_YN: 'Y',
        PW_CHECK_YN: 'Y',
        USER_ID: memberInfo.id,
        USER_NAME_LOC: memberInfo.name,
        USER_CP: memberInfo?.phoneNumber,
      };
      const result = await Action.sendSMSForCP(payload);
      if (result.TYPE === 1) {
        Util.toastMsg('인증번호가 발송되었습니다.', 'info');
        setIsPhoneAuthRequested(true);
      }
      if (result.TYPE === -1 && result.STATUS === 200) {
        Alert.alert('알림', `${result.MSG}\n관리자에게 문의하세요.`);
      }
    } catch (error) {
      Util.toastMsg('인증번호 발송 중 오류가 발생했습니다.', 'error');
    }
    setIsPhoneAuthVerified(false);
  };

  const confirmPhoneAuthCode = async () => {
    const payload = {
      OPEN_API_YN: 'Y',
      USER_CP: memberInfo?.phoneNumber,
      AUTH_CODE: memberInfo.authCode,
    };
    const result = await Action.checkAuthNumber(payload);
    if (result?.AUTH_YN === 'Y') {
      setIsPhoneAuthVerified(true);
      Util.toastMsg('인증번호가 확인되었습니다.', 'success');
    } else {
      setIsPhoneAuthVerified(false);
      setPhoneAuthMessage('인증번호를 정확하게 다시 입력해 주세요.');
    }
  };

  const handleResetPassword = async () => {
    const nextTouched: TouchedFields = {
      id: true,
      name: true,
      phoneNumber: true,
      authCode: true,
      pw: true,
      pwChk: true,
    };

    const nextErrors: ValidationErrors = {
      id: validateField('id', memberInfo.id),
      name: validateField('name', memberInfo.name),
      phoneNumber: validateField('phoneNumber', memberInfo.phoneNumber),
      authCode: validateField('authCode', memberInfo.authCode),
      pw: validateField('pw', memberInfo.pw),
      pwChk: validateField('pwChk', memberInfo.pwChk),
    };

    setTouched(nextTouched);
    setErrors(nextErrors);

    if (!isPhoneAuthVerified) {
      Util.toastMsg('휴대폰 인증을 완료해주세요.', 'error');
      return;
    }

    if (Object.values(nextErrors).some(Boolean)) {
      Util.toastMsg('입력값을 다시 확인해주세요.', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: memberInfo.id,
        name: memberInfo.name,
        phoneNumber: memberInfo.phoneNumber,
        pw: memberInfo.pw,
      };

      console.log('@@ reset password payload', payload);

      const res = await Action.resetPassword(payload);
      if (res.TYPE === 1) {
        Util.toastMsg('비밀번호가 재설정되었습니다.', 'info');
        navigation.goBack();
      }
    } catch (error) {
      Util.toastMsg('비밀번호 재설정 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLabelMessage = (
    key: keyof MemberInfo,
  ): { text: string; type: 'error' | 'success' | '' } => {
    if (!touched[key]) {
      return { text: '', type: '' };
    }

    if (errors[key]) {
      return { text: errors[key] || '', type: 'error' };
    }

    switch (key) {
      case 'phoneNumber':
        if (isPhoneAuthVerified) {
          return { text: '휴대폰 인증 완료', type: 'success' };
        }
        if (memberInfo.phoneNumber && phoneRegex.test(memberInfo.phoneNumber)) {
          return { text: '휴대폰 인증이 필요합니다.', type: 'error' };
        }
        return { text: '', type: '' };

      case 'authCode':
        if (isPhoneAuthVerified) {
          return { text: '확인되었습니다.', type: 'success' };
        }
        if (memberInfo.authCode.length === 6) {
          return { text: '확인 버튼을 눌러주세요.', type: 'success' };
        }
        return { text: '', type: '' };

      case 'pw':
        if (memberInfo.pw && pwRegex.test(memberInfo.pw)) {
          return {
            text: `비밀번호 강도: ${getPwStrength(memberInfo.pw)}`,
            type: 'success',
          };
        }
        return { text: '', type: '' };

      case 'pwChk':
        if (memberInfo.pwChk && memberInfo.pw === memberInfo.pwChk) {
          return { text: '새 비밀번호가 일치합니다.', type: 'success' };
        }
        return { text: '', type: '' };

      default:
        return { text: '', type: '' };
    }
  };

  const renderLabelMessage = (field: keyof MemberInfo) => {
    const message = getLabelMessage(field);

    if (!message.text) {
      return <Text style={styles.labelMessageText} />;
    }

    return (
      <Text
        style={[
          styles.labelMessageText,
          message.type === 'error'
            ? styles.labelErrorText
            : styles.labelSuccessText,
        ]}
      >
        {message.text}
      </Text>
    );
  };

  const isPhoneAuthRequestEnabled =
    idRegex.test(memberInfo.id) &&
    !!memberInfo.name.trim() &&
    phoneRegex.test(memberInfo.phoneNumber);

  const isPhoneAuthConfirmEnabled = memberInfo.authCode.length === 6;

  const isResetEnabled =
    isPhoneAuthVerified &&
    !!memberInfo.pw &&
    !!memberInfo.pwChk &&
    pwRegex.test(memberInfo.pw) &&
    memberInfo.pw === memberInfo.pwChk;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={180}
        >
          <View style={styles.container}>
            <View style={styles.titleBox}>
              <Text style={styles.title}>비밀번호 찾기</Text>
              <Text style={styles.subTitle}>
                본인 확인 후 새 비밀번호를 설정해주세요.
              </Text>
            </View>

            <View style={styles.sectionBox}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>아이디</Text>
                {renderLabelMessage('id')}
              </View>
              <TextField
                disabled={isPhoneAuthRequested}
                placeholderTextColor='lightgray'
                style={styles.textFieldSt}
                autoCapitalize='none'
                onChangeValue={(value: string) => updateMemberInfo('id', value)}
                onBlur={() => handleBlurField('id')}
                value={memberInfo.id}
              />

              <View style={styles.labelRow}>
                <Text style={styles.label}>이름</Text>
                {renderLabelMessage('name')}
              </View>
              <TextField
                disabled={isPhoneAuthRequested}
                placeholderTextColor='lightgray'
                style={styles.textFieldSt}
                autoCapitalize='none'
                onChangeValue={(value: string) =>
                  updateMemberInfo('name', value)
                }
                onBlur={() => handleBlurField('name')}
                value={memberInfo.name}
              />

              <View style={styles.labelRow}>
                <Text style={styles.label}>휴대폰 번호</Text>
                {renderLabelMessage('phoneNumber')}
              </View>
              <View style={[LVStyles.row, styles.inlineRow]}>
                <TextField
                  disabled={isPhoneAuthRequested}
                  keyboardType='numeric'
                  placeholder='ex. 01012345678'
                  maxLength={11}
                  placeholderTextColor='lightgray'
                  style={[styles.textFieldSt, styles.inlineInput]}
                  autoCapitalize='none'
                  onChangeValue={(value: string) =>
                    updateMemberInfo('phoneNumber', value)
                  }
                  onBlur={() => handleBlurField('phoneNumber')}
                  value={memberInfo.phoneNumber}
                />
                <LVButton
                  title={isPhoneAuthRequested ? '재전송' : '인증요청'}
                  disabled={!isPhoneFormatValid || isPhoneAuthVerified}
                  onPress={requestPhoneAuthCode}
                  buttonStyle={[
                    styles.button,
                    (!isPhoneFormatValid || isPhoneAuthVerified) &&
                      styles.buttonDisabled,
                  ]}
                  textStyle={{
                    color:
                      !isPhoneFormatValid || isPhoneAuthVerified
                        ? '#AEB6BF'
                        : '#27A7FF',
                  }}
                />
              </View>

              {isPhoneAuthRequested && !isPhoneAuthVerified && (
                <>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>인증번호</Text>
                    {renderLabelMessage('authCode')}
                  </View>

                  <View style={styles.authBox}>
                    <View style={[LVStyles.row, styles.inlineRow]}>
                      <TextField
                        keyboardType='numeric'
                        placeholder='인증번호 6자리 입력'
                        maxLength={6}
                        placeholderTextColor='lightgray'
                        style={[styles.textFieldSt, styles.inlineInput]}
                        autoCapitalize='none'
                        onChangeValue={(value: string) =>
                          updateMemberInfo('authCode', value)
                        }
                        onBlur={() => handleBlurField('authCode')}
                        value={memberInfo.authCode}
                      />
                      <LVButton
                        title='확인'
                        onPress={
                          memberInfo.authCode.length === 6
                            ? confirmPhoneAuthCode
                            : undefined
                        }
                        buttonStyle={[
                          styles.button,
                          memberInfo.authCode.length !== 6 &&
                            styles.buttonDisabled,
                        ]}
                        textStyle={{
                          color:
                            memberInfo.authCode.length === 6
                              ? '#27A7FF'
                              : '#AEB6BF',
                        }}
                      />
                    </View>

                    <View style={styles.authInfoRow}>
                      <Text style={[styles.labelErrorText]}>
                        {memberInfo?.authCode && phoneAuthMessage
                          ? phoneAuthMessage
                          : '인증번호를 입력한 뒤 확인 버튼을 눌러주세요.'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {isPhoneAuthVerified && (
              <View style={styles.sectionBox}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>새 비밀번호</Text>
                  {renderLabelMessage('pw')}
                </View>
                <TextField
                  placeholder='대소문자, 특수문자, 숫자 포함하여 8~16자'
                  maxLength={16}
                  placeholderTextColor='lightgray'
                  style={styles.textFieldSt}
                  autoCapitalize='none'
                  onChangeValue={(value: string) =>
                    updateMemberInfo('pw', value)
                  }
                  onBlur={() => handleBlurField('pw')}
                  value={memberInfo.pw}
                  secureTextEntry={!visiblePwd}
                />

                <View style={styles.labelRow}>
                  <Text style={styles.label}>새 비밀번호 확인</Text>
                  {renderLabelMessage('pwChk')}
                </View>
                <TextField
                  placeholder='새 비밀번호를 다시 입력하세요'
                  maxLength={16}
                  placeholderTextColor='lightgray'
                  style={styles.textFieldSt}
                  autoCapitalize='none'
                  onChangeValue={(value: string) =>
                    updateMemberInfo('pwChk', value)
                  }
                  onBlur={() => handleBlurField('pwChk')}
                  value={memberInfo.pwChk}
                  secureTextEntry={!visiblePwd}
                />

                <Text style={styles.guideText}>
                  비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함한 8~16자로
                  입력해주세요.
                </Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>

        <View style={[LVStyles.bottomButtonView]}>
          <LVButton
            title='비밀번호 재설정'
            disabled={!isResetEnabled}
            onPress={handleResetPassword}
            buttonStyle={styles.submitButton}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default SGN030101;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
  },
  buttonDisabled: {
    backgroundColor: '#F3F5F7',
    borderColor: '#D5DADF',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 5,
    paddingBottom: 120,
  },
  titleBox: {
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    color: '#373747',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subTitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBox: {
    marginBottom: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF1F4',
    borderRadius: 12,
    backgroundColor: '#FFF',
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
  labelMessageText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  labelErrorText: {
    color: '#FF9294',
  },
  labelSuccessText: {
    color: '#27A7FF',
  },
  textFieldSt: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderColor: 'lightgray',
    borderRadius: 8,
  },
  inlineRow: {
    marginBottom: 10,
  },
  inlineInput: {
    marginBottom: 0,
    flex: 1,
    marginRight: 8,
  },
  authBox: {
    marginTop: 2,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    borderRadius: 10,
    backgroundColor: '#FAFBFC',
  },
  authInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  authSuccessText: {
    color: '#27A7FF',
    fontWeight: '600',
  },
  authTimerText: {
    fontSize: 12,
    color: '#27A7FF',
    fontWeight: '600',
  },
  guideText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 4,
  },
  submitButton: {
    flex: 1,
  },
});
