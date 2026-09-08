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

const getInfoMOfCert = async (body: object) => {
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

const getListMOfCert = async (body: object) => {
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

const getEmpInfoOfCert = async (body: object) => {
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

const getDetailMOfCert = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'getDetailM', {
    body: JSON.stringify({
      PORU010203F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010203F1;
};

/**
 * 상신
 */
const saveApproval = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010203SVC', 'saveApproval', {
    body: JSON.stringify({
      PORU010203F1: body1,
      PORU010203G1: { data: body2 }, // 결재라인
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 회수
 */
const recall = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'Collect', {
    body: JSON.stringify({
      PORU010203F236: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 삭제
 */
const deleteMobile = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'delete', {
    body: JSON.stringify({
      PORU010203F236: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 회수 (결재자)
 */
const recallForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GCollect', {
    body: JSON.stringify({
      PORU010203F1: body1,
      PORU010203G1: { data: body2 },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 반려 (결재자)
 */
const refusalForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GApprovalCancel', {
    body: JSON.stringify({
      PORU010203F1: body1,
      PORU010203G1: { data: body2 },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 결재 (결재자)
 */
const approveForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GApproval', {
    body: JSON.stringify({
      PORU010203F1: body1,
      PORU010203G1: { data: body2 },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 출력 횟수 저장
 */
const savePrintCount = async (body: object) => {
  const result = await Fetch.request('PORU010203SVC', 'GPrintCount', {
    body: JSON.stringify({
      PORU010203G1: { data: body },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 재직증명서 발급
 */
const testEmploymentCertificate = async (body: object) => {
  const result = await Fetch.request(
    'AAAA010101SVC',
    'testEmploymentCertificate',
    {
      body: JSON.stringify({
        AAAA010101F1: body,
      }),
    },
  );
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  // 결재 (결재자)
  approveForApprover,
  // 계정 비밀번호 변경
  changePw,
  // 계정 비밀번호 동일여부 확인
  checkPw,
  deleteMobile,
  // 증명서 상세 조회
  getDetailMOfCert,
  // 증명서 사용자 정보 조회
  getEmpInfoOfCert,
  // 증명서 통계 조회
  getInfoMOfCert,
  // 증명서 리스트 조회
  getListMOfCert,
  // 계정 사용자 정보 조회 & 로그인 히스토리 (로그인 히스토리는 미사용)
  getUserInfoNLoginHistory,
  recall,
  // 회수 (결재자)
  recallForApprover,
  // 반려 (결재자)
  refusalForApprover,
  // 증명서 상신
  saveApproval,
  savePrintCount,
  // 계정 사용자 정보 변경
  saveUserInfo,
  testEmploymentCertificate,
};
