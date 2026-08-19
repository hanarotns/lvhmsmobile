import { Fetch, Util } from '@/src/lib';

const getUserInfoNLoginHistory = async (body: object) => {
  // {
  //   COM060104F1: {
  //     F_USER_ID: 'shpark93',
  //     F_COMPANY_CODE: 'HTNS',
  //     F_USER_LANG: 'KO',
  //     C_PW: 'Xoheexohee0*',
  //     N_PW: 'Xoheexohee0*1',
  //     N_PW_C: 'Xoheexohee0*1',
  //     F_EXPIRED_DATE: '20261231',
  //     F_USER_NAME_LOC: '박소희',
  //     F_USER_NAME_ENG: 'Park So Hee',
  //     POSITION_NAME: '대리',
  //     DUTY_NAME: '일반대상자',
  //     DEPT_NAME: '시스템개발팀',
  //     F_EMP_ID: 'KR20232328',
  //     F_EMAIL: 'shpark93@htns.com',
  //     F_TEL_NO: '031-377-0972',
  //     F_FAX_NO: '',
  //     F_USER_CP: '',
  //     H_PW: '',
  //     F_DEPT_CODE: 'M10703',
  //   },
  //   pageId: 'COM060102V',
  // };
  const result = await Fetch.request('COM060104SVC', 'get', {
    body: JSON.stringify({
      COM060104F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const checkPw = async (body: object) => {
  // {C_PW: 'sajfldksjf;ladsjl;', pageId: 'COM060102V'};
  const result = await Fetch.request('COM060104SVC', 'checkPw', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const changePw = async (body: object) => {
  // {
  //   COM060104F1: {
  //     F_USER_ID: 'shpark93',
  //     F_COMPANY_CODE: 'HTNS',
  //     F_USER_LANG: 'KO',
  //     C_PW: 'Xoheexohee0*',
  //     N_PW: 'Xoheexohee0*1',
  //     N_PW_C: 'Xoheexohee0*1',
  //     F_EXPIRED_DATE: '20261231',
  //     F_USER_NAME_LOC: '박소희',
  //     F_USER_NAME_ENG: 'Park So Hee',
  //     POSITION_NAME: '대리',
  //     DUTY_NAME: '일반대상자',
  //     DEPT_NAME: '시스템개발팀',
  //     F_EMP_ID: 'KR20232328',
  //     F_EMAIL: 'shpark93@htns.com',
  //     F_TEL_NO: '031-377-0972',
  //     F_FAX_NO: '',
  //     F_USER_CP: '',
  //     H_PW: '',
  //     F_DEPT_CODE: 'M10703',
  //   },
  // };
  const result = await Fetch.request('COM060104SVC', 'changepw', {
    body: JSON.stringify({
      COM060104F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const saveUserInfo = async (body: object) => {
  // {
  //   COM060104F1: {
  //     F_USER_ID: 'shpark93',
  //     F_COMPANY_CODE: 'HTNS',
  //     F_USER_LANG: 'EN',
  //     C_PW: '',
  //     N_PW: '',
  //     N_PW_C: '',
  //     F_EXPIRED_DATE: '20260723',
  //     F_USER_NAME_LOC: '박소희',
  //     F_USER_NAME_ENG: 'Park So Hee',
  //     POSITION_NAME: '대리',
  //     DUTY_NAME: '일반대상자',
  //     DEPT_NAME: '시스템개발팀',
  //     F_EMP_ID: 'KR20232328',
  //     F_EMAIL: 'shpark93@htns.com',
  //     F_TEL_NO: '031-377-0972',
  //     F_FAX_NO: '',
  //     F_USER_CP: '',
  //     H_PW: '',
  //     F_DEPT_CODE: 'M10703',
  //   },
  //   pageId: 'COM060102V',
  // };
  const result = await Fetch.request('COM060104SVC', 'save', {
    body: JSON.stringify({
      COM060104F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const getCertificateInfo = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'getInfoM', {
    body: JSON.stringify({
      PORU010203F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010203F1;
};

const getCertificateList = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'getListM', {
    body: JSON.stringify({
      PORU010203F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010203G1;
};

const getCertificateEmpInfo = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'getEmpInfo', {
    body: JSON.stringify({
      PORU010203F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010203F3;
};

const saveCertificate = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GMobileSend', {
    body: JSON.stringify({
      PORU010203G1: {
        data: body,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const deleteCertificate = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GDelete', {
    body: JSON.stringify({
      PORU010203G1: {
        data: body,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  // 계정 비밀번호 변경
  changePw,
  // 계정 비밀번호 동일여부 확인
  checkPw,
  // 증명서 삭제
  deleteCertificate,
  // 증명서 사용자 정보 조회
  getCertificateEmpInfo,
  // 증명서 통계 조회
  getCertificateInfo,
  // 증명서 리스트 조회
  getCertificateList,
  // 계정 사용자 정보 조회 & 로그인 히스토리 (로그인 히스토리는 미사용)
  getUserInfoNLoginHistory,
  // 중명서 저장 및 전송
  saveCertificate,
  // 계정 사용자 정보 변경
  saveUserInfo,
};
