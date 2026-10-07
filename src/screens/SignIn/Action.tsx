import { Fetch, Util } from '@/src/lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

// 로그인 처리
const signIn = async (loginInfo) => {
  const loginId = loginInfo.loginId;
  const loginPwd = loginInfo.loginPwd;
  try {
    const token = await Fetch.tokenHttp();
    if (token === false) {
      return;
    }
    const csrf = _.get(token, 'signaldata.X-CSRF-TOKEN');
    const result = await Fetch.loginHttp(csrf, loginId, loginPwd);
    let message = _.get(result, 'MSG');
    const type = _.get(result, 'TYPE');
    const status = _.get(result, 'STATUS');
    if (type === 200111 || type === 200130 || status === 403) {
      if (type === 200111) {
        message = '아이디와 비밀번호를 확인해주세요.';
      }
      Util.toastMsg(message, 'info');
      return Fetch.getInit(); // @@ 한 번 더 확인 필요 (아이디/비번 오류 코드로 인한 추가)
    } else {
      AsyncStorage.setItem('loginId', loginInfo.loginId);
      AsyncStorage.setItem('loginPwd', loginInfo.loginPwd);
      AsyncStorage.setItem('autoLogin', loginInfo.autoLogin);
      AsyncStorage.setItem(
        'isRememberLogin',
        JSON.stringify(loginInfo.isRememberLogin),
      );
      AsyncStorage.setItem('isPreHire', JSON.stringify(loginInfo.isPreHire));
      return Fetch.getInit();
    }
  } catch (e) {}
};

// ID 중복체크
const checkDuplicateId = async (body: object) => {
  const result = await Fetch.request('apicall', 'checkDuplicateId', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.DATA;
};

// 인증요청
const sendSMSForCP = async (body: object) => {
  const result = await Fetch.request('apicall', 'sendSMSForCP', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

// 인증번호 체크
const checkAuthNumber = async (body: object) => {
  const result = await Fetch.request('apicall', 'checkAuthNumber', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.DATA;
};

// 회원가입 신청
const applyOfSignUp = async (body: object) => {
  const result = await Fetch.request('apicall', 'applyOfSignUp', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

// 비밀번호 변경
const resetPassword = async (body: object) => {
  const result = await Fetch.request('apicall', 'resetPassword', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

// 회원가입 승인상태 확인
const checkPendingSignupRequestM = async (body: object) => {
  const result = await Fetch.request('apicall', 'checkPendingSignupRequestM', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.DATA;
};

// 일용직 사용 법인코드 가져오기
const getCompanyList = async (body: object) => {
  const result = await Fetch.request('apicall', 'getCompanyList', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.DATA;
};

export {
  // 회원가입 신청
  applyOfSignUp,
  // 인증번호 체크
  checkAuthNumber,
  // ID 중복체크
  checkDuplicateId,
  // 회원가입 승인상태 확인
  checkPendingSignupRequestM,
  getCompanyList,
  // 비밀번호 변경
  resetPassword,
  // 인증요청
  sendSMSForCP,
  // 로그인 처리
  signIn,
};
