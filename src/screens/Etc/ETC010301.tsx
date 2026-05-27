import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
import { Fetch, Util } from '@/src/lib';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

type MemberInfo = {
  pw: string;
  pwNew: string;
  pwChkNew: string;
};

type ValidationErrors = Partial<Record<keyof MemberInfo, string>>;
type TouchedFields = Partial<Record<keyof MemberInfo, boolean>>;
type LabelMessageType = 'error' | 'success' | '';

const FIELD_LIST: {
  key: number;
  checkId: keyof MemberInfo;
  label: string;
}[] = [
  { key: 1, checkId: 'pw', label: '현재 비밀번호' },
  { key: 2, checkId: 'pwNew', label: '새 비밀번호' },
  { key: 3, checkId: 'pwChkNew', label: '새 비밀번호 확인' },
];

const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

const ETC010301 = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();

  const [loading, setLoading] = useState(true);
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    pw: '',
    pwNew: '',
    pwChkNew: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [visiblePwd, setVisiblePwd] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(true);
    const payload = {};
    const res = await Action.getUserInfoNLoginHistory(payload);
    setUserInfo(res?.COM060104F1);
    setLoginHistory(res?.COM060104G1);
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
      case 'pwNew':
        if (!value) return '비밀번호를 입력하세요.';
        if (!pwRegex.test(value)) {
          return '대/소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다.';
        }
        return '';

      case 'pwChkNew':
        if (!value) return '비밀번호 확인을 입력하세요.';
        if (value !== target.pwNew) return '비밀번호가 일치하지 않습니다.';
        return '';

      default:
        return '';
    }
  };

  const updateMemberInfo = (key: keyof MemberInfo, value: string) => {
    let nextValue = value;

    const nextMemberInfo: MemberInfo = {
      ...memberInfo,
      [key]: nextValue,
    };

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

      if (key === 'pw' && touched.pwChkNew) {
        nextErrors.pwChkNew = validateField(
          'pwChkNew',
          nextMemberInfo.pwChkNew,
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

  const getLabelMessage = (
    key: keyof MemberInfo,
  ): { text: string; type: LabelMessageType } => {
    if (!touched[key]) {
      return { text: '', type: '' };
    }

    if (errors[key]) {
      return { text: errors[key] || '', type: 'error' };
    }

    switch (key) {
      case 'pwNew':
        if (memberInfo.pw && pwRegex.test(memberInfo.pw)) {
          return {
            text: `비밀번호 강도: ${getPwStrength(memberInfo.pw)}`,
            type: 'success',
          };
        }
        return { text: '', type: '' };

      case 'pwChkNew':
        if (memberInfo.pwChkNew && memberInfo.pw === memberInfo.pwChkNew) {
          return { text: '비밀번호가 일치합니다.', type: 'success' };
        }
        return { text: '', type: '' };

      default:
        return { text: '', type: '' };
    }
  };

  const validateForm = () => {
    const nextTouched: TouchedFields = {
      pwNew: true,
      pwChkNew: true,
    };

    const nextErrors: ValidationErrors = {
      pwNew: validateField('pw', memberInfo.pwNew),
      pwChkNew: validateField('pwChkNew', memberInfo.pwChkNew),
    };

    setTouched(nextTouched);
    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      Util.toastMsg('입력값을 다시 확인해주세요.', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload1 = {
        C_PW: memberInfo?.pw,
      };
      const result1 = await Action.checkPw(payload1);
      if (result1.TYPE !== 1) {
        Util.toastMsg(
          '현재 비밀번호가 일치하지 않습니다.', // result1.MSG
          'error',
        );
        return;
      }
      if (memberInfo?.pw === memberInfo?.pwNew) {
        Util.toastMsg('현재 비밀번호와 변경 비밀번호가 동일합니다.', 'error');
        return;
      }
      const payload2 = {
        F_USER_ID: sessioninfo?.USER_ID,
        F_COMPANY_CODE: sessioninfo?.COMPANY_CODE,
        C_PW: memberInfo.pw,
        N_PW: memberInfo.pwNew,
        N_PW_C: memberInfo.pwChkNew,
      };
      const result2 = await Action.changePw(payload2);
      if (result2.TYPE === 1) {
        Fetch.logout().then((result) => {
          if (result) {
            setSessionInfo(null);
            Util.toastMsg('비밀번호 변경이 완료되었습니다.', 'info');
          }
        });
      } else {
        Util.toastMsg(result2.MSG, 'error');
      }
    } catch (error) {
      Util.toastMsg('비밀번호 변경 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
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

  const renderTextField = (field: keyof MemberInfo) => {
    switch (field) {
      case 'pw':
        return (
          <TextField
            placeholder='대소문자, 특수문자, 숫자 포함하여 8~16자'
            maxLength={16}
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) => updateMemberInfo('pw', value)}
            onBlur={() => handleBlurField('pw')}
            value={memberInfo.pw}
            secureTextEntry={!visiblePwd}
          />
        );

      case 'pwNew':
        return (
          <TextField
            placeholder='대소문자, 특수문자, 숫자 포함하여 8~16자'
            maxLength={16}
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) => updateMemberInfo('pwNew', value)}
            onBlur={() => handleBlurField('pwNew')}
            value={memberInfo.pwNew}
            secureTextEntry={!visiblePwd}
          />
        );

      case 'pwChkNew':
        return (
          <TextField
            placeholder='대소문자, 특수문자, 숫자 포함하여 8~16자'
            maxLength={16}
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) =>
              updateMemberInfo('pwChkNew', value)
            }
            onBlur={() => handleBlurField('pwChkNew')}
            value={memberInfo.pwChkNew}
            secureTextEntry={!visiblePwd}
          />
        );

      default:
        return null;
    }
  };

  const isFormFilled = Object.values(memberInfo).every(Boolean);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
      }}
    >
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={20}
        >
          <View>
            <View style={styles.container}>
              <View style={{ padding: 8 }}>
                {FIELD_LIST.map((field) => (
                  <React.Fragment key={field.key}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>{field.label}</Text>
                    </View>
                    {renderTextField(field.checkId)}
                    {renderLabelMessage(field.checkId)}
                    <View style={{ height: 16 }} />
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View style={[LVStyles.bottomButtonView]}>
          <LVButton
            title='변경'
            onPress={handleRegister}
            buttonStyle={{
              flex: 1,
              backgroundColor: isFormFilled ? '#27A7FF' : 'lightgrey',
            }}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default ETC010301;

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
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
    marginBottom: 100,
    padding: 5,
    flex: 1,
    flexDirection: 'column',
  },
  textFieldSt: {
    width: '100%',
    marginBottom: 0,
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
  phoneAuthWrapper: {
    marginTop: -2,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    borderRadius: 10,
    backgroundColor: '#FAFBFC',
  },
  phoneAuthRow: {
    marginBottom: 8,
  },
  phoneAuthInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneAuthInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  phoneAuthSubText: {
    fontSize: 12,
    color: '#27A7FF',
    fontWeight: '600',
  },
});
