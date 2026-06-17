import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVButton,
  LVLoadingIndicator,
  LVRadioButton,
  LVStyles,
  SafeAreaView,
  Text,
  TextField,
} from '@/src/components';
import { Util } from '@/src/lib';
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
  id: string;
  pw: string;
  pwChk: string;
  name: string;
  birthday: string;
  gender: 'M' | 'F' | '';
  phoneNumber: string;
  email: string;
};

type ValidationErrors = Partial<Record<keyof MemberInfo, string>>;
type TouchedFields = Partial<Record<keyof MemberInfo, boolean>>;
type LabelMessageType = 'error' | 'success' | '';

const FIELD_LIST: {
  key: number;
  checkId: keyof MemberInfo;
  label: string;
}[] = [
  { key: 1, checkId: 'id', label: '아이디' },
  { key: 2, checkId: 'pw', label: '비밀번호' },
  { key: 3, checkId: 'pwChk', label: '비밀번호 확인' },
  { key: 4, checkId: 'name', label: '이름' },
  { key: 5, checkId: 'birthday', label: '생년월일' },
  { key: 6, checkId: 'gender', label: '성별' },
  { key: 7, checkId: 'phoneNumber', label: '휴대폰 번호' },
  { key: 8, checkId: 'email', label: '개인 이메일' },
];

const idRegex = /^[a-z][a-z0-9]{4,19}$/;
const birthdayRegex = /^\d{6}$/;
const phoneRegex = /^01[0-9]\d{7,8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

const SGN010201 = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);

  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    id: '',
    pw: '',
    pwChk: '',
    name: '',
    birthday: '',
    gender: '',
    phoneNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [visiblePwd, setVisiblePwd] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  // 휴대폰 인증 UI용 state (레이아웃용)
  const [isPhoneAuthRequested, setIsPhoneAuthRequested] = useState(false);
  const [isPhoneAuthVerified, setIsPhoneAuthVerified] = useState(false);
  const [phoneAuthCode, setPhoneAuthCode] = useState('');
  const [phoneAuthMessage, setPhoneAuthMessage] = useState('');

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(false);
  };

  const isValidBirthday = (value: string) => {
    if (!birthdayRegex.test(value)) {
      return false;
    }

    const yy = Number(value.slice(0, 2));
    const mm = Number(value.slice(2, 4));
    const dd = Number(value.slice(4, 6));

    if (mm < 1 || mm > 12) {
      return false;
    }

    const fullYear = 2000 + yy;
    const lastDay = new Date(fullYear, mm, 0).getDate();

    return dd >= 1 && dd <= lastDay;
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
        if (!value) return '아이디를 입력하세요.';
        if (!idRegex.test(value)) {
          return '영문 소문자로 시작하는 5~20자의 영문/숫자만 가능합니다.';
        }
        if (!isIdChecked || !isIdAvailable) {
          return '아이디 중복확인을 해주세요.';
        }
        return '';

      case 'pw':
        if (!value) return '비밀번호를 입력하세요.';
        if (!pwRegex.test(value)) {
          return '대/소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다.';
        }
        return '';

      case 'pwChk':
        if (!value) return '비밀번호 확인을 입력하세요.';
        if (value !== target.pw) return '비밀번호가 일치하지 않습니다.';
        return '';

      case 'name':
        if (!value.trim()) return '이름을 입력하세요.';
        return '';

      case 'birthday':
        if (!value) return '생년월일을 입력하세요.';
        if (!birthdayRegex.test(value)) return '생년월일 6자리를 입력하세요.';
        if (!isValidBirthday(value)) return '올바른 생년월일이 아닙니다.';
        return '';

      case 'gender':
        if (!value) return '성별을 선택하세요.';
        return '';

      case 'phoneNumber':
        if (!value) return '휴대폰 번호를 입력하세요.';
        if (!phoneRegex.test(value)) {
          return '휴대폰 번호 형식이 올바르지 않습니다.';
        }
        return '';

      case 'email':
        if (!value) return '이메일을 입력하세요.';
        if (!emailRegex.test(value)) {
          return '이메일 형식이 올바르지 않습니다.';
        }
        return '';

      default:
        return '';
    }
  };

  const isIdFormatValid = idRegex.test(memberInfo.id);
  const isPhoneFormatValid = phoneRegex.test(memberInfo.phoneNumber);

  const updateMemberInfo = (key: keyof MemberInfo, value: string) => {
    let nextValue = value;

    if (key === 'id') {
      nextValue = value.trim().toLowerCase();
    }

    if (key === 'birthday' || key === 'phoneNumber') {
      nextValue = value.replace(/[^0-9]/g, '');
    }

    const nextMemberInfo: MemberInfo = {
      ...memberInfo,
      [key]: nextValue,
    };

    if (key === 'id') {
      setIsIdChecked(false);
      setIsIdAvailable(false);
    }

    if (key === 'phoneNumber') {
      setIsPhoneAuthRequested(false);
      setPhoneAuthCode('');
      setPhoneAuthMessage('');
      setIsPhoneAuthVerified(false);
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

      if (key === 'id' && touched.id) {
        nextErrors.id = idRegex.test(nextValue)
          ? '아이디 중복확인을 해주세요.'
          : validateField('id', nextValue, nextMemberInfo);
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
      case 'id':
        if (memberInfo.id && isIdChecked && isIdAvailable) {
          return { text: '사용 가능한 아이디', type: 'success' };
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
          return { text: '비밀번호가 일치합니다.', type: 'success' };
        }
        return { text: '', type: '' };

      case 'birthday':
        if (memberInfo.birthday && isValidBirthday(memberInfo.birthday)) {
          return { text: '확인되었습니다.', type: 'success' };
        }
        return { text: '', type: '' };

      case 'gender':
        if (memberInfo.gender) {
          return { text: '확인되었습니다.', type: 'success' };
        }
        return { text: '', type: '' };

      case 'phoneNumber':
        if (isPhoneAuthVerified) {
          return { text: '휴대폰 인증 완료', type: 'success' };
        }
        if (memberInfo.phoneNumber && phoneRegex.test(memberInfo.phoneNumber)) {
          return { text: '휴대폰 인증이 필요합니다.', type: 'error' };
        }
        return { text: '', type: '' };

      case 'email':
        if (memberInfo.email && emailRegex.test(memberInfo.email)) {
          return { text: '확인되었습니다.', type: 'success' };
        }
        return { text: '', type: '' };

      default:
        return { text: '', type: '' };
    }
  };

  const validateForm = () => {
    const nextTouched: TouchedFields = {
      id: true,
      pw: true,
      pwChk: true,
      name: true,
      birthday: true,
      gender: true,
      phoneNumber: true,
      email: true,
    };

    const nextErrors: ValidationErrors = {
      id: validateField('id', memberInfo.id),
      pw: validateField('pw', memberInfo.pw),
      pwChk: validateField('pwChk', memberInfo.pwChk),
      name: validateField('name', memberInfo.name),
      birthday: validateField('birthday', memberInfo.birthday),
      gender: validateField('gender', memberInfo.gender),
      phoneNumber: validateField('phoneNumber', memberInfo.phoneNumber),
      email: validateField('email', memberInfo.email),
    };

    setTouched(nextTouched);
    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const checkDuplicateId = async () => {
    if (!isIdFormatValid) {
      return;
    }

    const id = memberInfo.id.trim().toLowerCase();

    setTouched((prev) => ({
      ...prev,
      id: true,
    }));

    const payload = {
      OPEN_API_YN: 'Y',
      USER_ID: id,
    };

    try {
      const result = await Action.checkDuplicateId(payload);

      if (result?.CNT !== 0) {
        setIsIdChecked(true);
        setIsIdAvailable(false);
        setErrors((prev) => ({
          ...prev,
          id: '이미 사용 중인 아이디입니다.',
        }));
        return;
      }

      setIsIdChecked(true);
      setIsIdAvailable(true);
      setErrors((prev) => ({
        ...prev,
        id: '',
      }));
    } catch (error) {
      Util.toastMsg('아이디 중복확인 중 오류가 발생했습니다.', 'error');
    }
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
    setIsPhoneAuthRequested(true);
    try {
      const payload = {
        OPEN_API_YN: 'Y',
        USER_CP: memberInfo?.phoneNumber,
      };
      const result = await Action.sendSMSForCP(payload);
      if (result.TYPE === 1) {
        Util.toastMsg('인증번호가 발송되었습니다.', 'info');
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
      AUTH_CODE: phoneAuthCode,
    };

    const result = await Action.checkAuthNumber(payload);
    if (result?.AUTH_YN === 'Y') {
      setIsPhoneAuthVerified(true);
      setIsPhoneAuthRequested(false);
    } else {
      setIsPhoneAuthVerified(false);
      setPhoneAuthMessage('인증번호를 정확하게 다시 입력해 주세요.');
    }
  };

  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      Util.toastMsg('입력값을 다시 확인해주세요.', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        OPEN_API_YN: 'Y',
        USER_ID: memberInfo?.id,
        PW: memberInfo?.pwChk,
        USER_NAME: memberInfo?.name,
        BIRTHDAY: memberInfo?.birthday,
        GENDER: memberInfo?.gender,
        USER_CP: memberInfo?.phoneNumber,
        EMAIL: memberInfo?.email,
      };

      const result = await Action.applyOfSignUp(payload);
      if (result.TYPE === 1) {
        Util.toastMsg('회원가입 신청이 완료되었습니다.', 'info');
        movingScreen.goBack();
        movingScreen.goBack();
      } else {
        Util.toastMsg(result.MSG, 'error');
      }
    } catch (error) {
      Util.toastMsg('회원가입 신청 중 오류가 발생했습니다.', 'error');
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

  const renderPhoneVerificationSection = () => {
    return (
      <View style={styles.phoneAuthWrapper}>
        <View style={[LVStyles.row, styles.phoneAuthRow]}>
          <TextField
            keyboardType='numeric'
            placeholder='인증번호 6자리 입력'
            maxLength={6}
            placeholderTextColor='lightgray'
            style={[
              styles.textFieldSt,
              { marginBottom: 0, flex: 1, marginRight: 8 },
            ]}
            autoCapitalize='none'
            onChangeValue={(value: string) =>
              setPhoneAuthCode(value.replace(/[^0-9]/g, ''))
            }
            value={phoneAuthCode}
          />
          <LVButton
            title='확인'
            onPress={
              phoneAuthCode.length === 6 ? confirmPhoneAuthCode : undefined
            }
            buttonStyle={[
              styles.button,
              phoneAuthCode.length !== 6 && styles.buttonDisabled,
            ]}
            textStyle={{
              color: phoneAuthCode.length === 6 ? '#27A7FF' : '#AEB6BF',
            }}
          />
        </View>

        <View style={styles.phoneAuthInfoBox}>
          <Text style={styles.phoneAuthInfoText}>
            {phoneAuthMessage || '인증번호를 입력하고 확인 버튼을 눌러주세요.'}
          </Text>
          {/* <Text style={styles.phoneAuthSubText}>남은 시간 03:00</Text> */}
        </View>
      </View>
    );
  };

  const renderTextField = (field: keyof MemberInfo) => {
    switch (field) {
      case 'id':
        return (
          <View style={[LVStyles.row, { marginBottom: 10 }]}>
            <TextField
              placeholderTextColor='#999FA8'
              style={[
                styles.textFieldSt,
                { marginBottom: 0, flex: 1, marginRight: 8 },
              ]}
              autoCapitalize='none'
              onChangeValue={(value: string) => updateMemberInfo('id', value)}
              onBlur={() => handleBlurField('id')}
              value={memberInfo.id}
            />
            <LVButton
              title='중복확인'
              disabled={!isIdFormatValid}
              onPress={checkDuplicateId}
              buttonStyle={[
                styles.button,
                !isIdFormatValid && styles.buttonDisabled,
              ]}
              textStyle={{
                color: isIdFormatValid ? '#27A7FF' : '#AEB6BF',
              }}
            />
          </View>
        );

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

      case 'pwChk':
        return (
          <TextField
            placeholder='대소문자, 특수문자, 숫자 포함하여 8~16자'
            maxLength={16}
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) => updateMemberInfo('pwChk', value)}
            onBlur={() => handleBlurField('pwChk')}
            value={memberInfo.pwChk}
            secureTextEntry={!visiblePwd}
          />
        );

      case 'name':
        return (
          <TextField
            placeholderTextColor='#141414'
            maxLength={20}
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) => updateMemberInfo('name', value)}
            onBlur={() => handleBlurField('name')}
            value={memberInfo.name}
          />
        );

      case 'birthday':
        return (
          <TextField
            keyboardType='numeric'
            placeholder='ex. 900101'
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            maxLength={6}
            onChangeValue={(value: string) =>
              updateMemberInfo('birthday', value)
            }
            onBlur={() => handleBlurField('birthday')}
            value={memberInfo.birthday}
          />
        );

      case 'gender':
        return (
          <View
            style={[
              LVStyles.row,
              { justifyContent: 'flex-start', marginBottom: 20 },
            ]}
          >
            <LVRadioButton
              title='남성'
              gubun={memberInfo.gender === 'M'}
              onPress={() => {
                updateMemberInfo('gender', 'M');
                setTouched((prev) => ({ ...prev, gender: true }));
                setErrors((prev) => ({ ...prev, gender: '' }));
              }}
            />
            <LVRadioButton
              title='여성'
              gubun={memberInfo.gender === 'F'}
              onPress={() => {
                updateMemberInfo('gender', 'F');
                setTouched((prev) => ({ ...prev, gender: true }));
                setErrors((prev) => ({ ...prev, gender: '' }));
              }}
            />
          </View>
        );

      case 'phoneNumber':
        return (
          <>
            <View style={[LVStyles.row, { marginBottom: 10 }]}>
              <TextField
                keyboardType='numeric'
                placeholder='ex. 01012345678'
                maxLength={11}
                placeholderTextColor='lightgray'
                style={[
                  styles.textFieldSt,
                  { marginBottom: 0, flex: 1, marginRight: 8 },
                ]}
                autoCapitalize='none'
                onChangeValue={(value: string) =>
                  updateMemberInfo('phoneNumber', value)
                }
                onBlur={() => handleBlurField('phoneNumber')}
                value={memberInfo.phoneNumber}
              />
              <LVButton
                title={isPhoneAuthRequested ? '재전송' : '인증요청'}
                disabled={!isPhoneFormatValid}
                onPress={requestPhoneAuthCode}
                buttonStyle={[
                  styles.button,
                  !isPhoneFormatValid && styles.buttonDisabled,
                ]}
                textStyle={{
                  color: isPhoneFormatValid ? '#27A7FF' : '#AEB6BF',
                }}
              />
            </View>

            {isPhoneAuthRequested && renderPhoneVerificationSection()}
          </>
        );

      case 'email':
        return (
          <TextField
            keyboardType='email-address'
            placeholder='ex. youremail@gmail.com'
            placeholderTextColor='lightgray'
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(value: string) => updateMemberInfo('email', value)}
            onBlur={() => handleBlurField('email')}
            value={memberInfo.email}
          />
        );

      default:
        return null;
    }
  };

  const isFormFilled = Object.values(memberInfo).every(Boolean);

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
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
            <View style={{ padding: 8 }}>
              {FIELD_LIST.map((field) => (
                <React.Fragment key={field.key}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderLabelMessage(field.checkId)}
                  </View>
                  {renderTextField(field.checkId)}
                </React.Fragment>
              ))}
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View style={[LVStyles.bottomButtonView]}>
          <LVButton
            title='회원가입 신청'
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
export default SGN010201;

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
