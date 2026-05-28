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

type UserInfo = {};

type ValidationErrors = Partial<Record<keyof UserInfo, string>>;
type TouchedFields = Partial<Record<keyof UserInfo, boolean>>;

const ETC010201 = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const movingScreen = useNavigation();
  const isFocused = useIsFocused();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const [userInfo, setUserInfo] = useState({});
  const [loginHistory, setLoginHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

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

  const updateUserInfo = (key: keyof UserInfo, value: string) => {
    let nextValue = value;

    const nextUserInfo: UserInfo = {
      ...userInfo,
      [key]: nextValue,
    };

    setUserInfo(nextUserInfo);
  };

  /**
   * 비즈니스 로직 확인용
   * * @returns {Boolean}
   */
  const checkLogic = async () => {
    if (Util.isEmpty(userInfo)) {
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
    }

    setLoading(true);
    const result = await Action.saveUserInfo(userInfo);
    if (result.TYPE === 1) {
      setLoading(false);
      Util.toastMsg('정상적으로 저장되었습니다.', 'info');
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
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
              <View style={{}}>
                <Form label='법인명' value={userInfo?.COMPANY_NAME} />
                <Form label='부서명' value={userInfo?.DEPT_NAME} />
                <Form label='아이디' value={userInfo?.F_USER_ID} />
                <Form label='사원번호' value={userInfo?.F_EMP_ID} />
                <Form
                  label='이름'
                  value={`${userInfo?.F_USER_NAME_LOC} ( ${userInfo?.F_USER_NAME_ENG} )`}
                />
                <Form label='직급' value={userInfo?.POSITION_NAME} />
                <Form label='직책' value={userInfo?.DUTY_NAME} />
                <Form
                  label='이메일'
                  fieldKey='F_EMAIL'
                  value={userInfo?.F_EMAIL}
                  editType={'input'}
                  onChange={updateUserInfo}
                />
                <Form
                  label='전화번호'
                  fieldKey='F_TEL_NO'
                  value={userInfo?.F_TEL_NO}
                  editType={'input'}
                  onChange={updateUserInfo}
                />
                <Form
                  label='팩스번호'
                  fieldKey='F_FAX_NO'
                  value={userInfo?.F_FAX_NO}
                  editType={'input'}
                  onChange={updateUserInfo}
                />
                <Form
                  label='휴대폰번호'
                  fieldKey='F_USER_CP'
                  value={userInfo?.F_USER_CP}
                  editType={'input'}
                  onChange={updateUserInfo}
                />
                <Form
                  label='언어'
                  fieldKey='F_USER_LANG'
                  value={userInfo?.F_USER_LANG}
                  editType={'radio'}
                  onChange={updateUserInfo}
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View style={[LVStyles.row, LVStyles.bottomButtonView]}>
          <LVButton
            title='저장'
            onPress={handleSave}
            buttonStyle={{
              flex: 1,
              backgroundColor: '#27A7FF',
            }}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default ETC010201;

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
    padding: 0,

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

const Form = (props: any) => {
  const { label, fieldKey, value, editType, onChange } = props;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 48 }}>
      <View
        style={{
          width: '20%',
        }}
      >
        <Text
          style={{
            fontWeight: '600',
            fontSize: 14,
            color: '#6A727B',
          }}
        >
          {label}
        </Text>
      </View>
      <View
        style={{
          width: '80%',
        }}
      >
        {editType === 'input' && (
          <TextField
            style={styles.textFieldSt}
            autoCapitalize='none'
            onChangeValue={(p) => {
              onChange(fieldKey, p);
            }}
            value={value}
          />
        )}
        {editType === 'radio' && (
          <View
            style={[
              LVStyles.row,
              {
                justifyContent: 'flex-start',
                alignItems: 'center',
              },
            ]}
          >
            <LVRadioButton
              title='KO(한국어)'
              gubun={value === 'KO'}
              onPress={() => {
                onChange('F_USER_LANG', 'KO');
              }}
            />
            <LVRadioButton
              title='EN(영어)'
              gubun={value === 'EN'}
              onPress={() => {
                onChange('F_USER_LANG', 'EN');
              }}
            />
          </View>
        )}
        {Util.isEmpty(editType) && (
          <Text
            style={{
              fontWeight: '700',
              fontSize: 14,
              color: '#373747',
            }}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
};
