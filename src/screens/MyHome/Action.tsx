import { Fetch, Util } from '@/src/lib';
import env from '@/src/lib/env';
import CookieManager from '@react-native-cookies/cookies';
const fetchURL = env().fetchURL;

// @@ API 신규 정의 필요 (유사 API없음.)
const getEmpInfoM = async (body: object) => {
  const result = await Fetch.request('AAAA010101SVC', 'getEmpInfoM', {
    body: JSON.stringify({
      AAAA010101F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.AAAA010101F1;
};

const getInfoM = async (body: object) => {
  const result = await Fetch.request('PORM020201SVC', 'getMobile2', {
    body: JSON.stringify({
      PORM020201F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020201F1;
};

const getJobApplyList = async () => {
  const result = await Fetch.request('AAAA010101SVC', 'getJobApplyList', {
    body: JSON.stringify({
      AAAA010101F1: {},
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.AAAA010101G1;
};

const getJobPostList = async () => {
  const result = await Fetch.request('AAAA010101SVC', 'getJobPostList', {
    body: JSON.stringify({
      AAAA010101F1: {},
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.AAAA010101G1;
};

const save = async (body: object) => {
  const result = await Fetch.request('AAAA010101SVC', 'save', {
    body: JSON.stringify({
      AAAA010101F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const LaborRefusalNotice = async (body: object) => {
  const result = await Fetch.request('PORM020113SVC', 'LaborRefusalNotice', {
    body: JSON.stringify({
      PORM020113F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020113F1;
};

const LaborRefusalNotice2 = async (body: object) => {
  const result = await Fetch.request('PORM020113SVC', 'LaborRefusalNotice2', {
    body: JSON.stringify({
      PORM020113F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020113F1;
};

const LaborRefusal_get = async (body: object) => {
  const result = await Fetch.request('PORM020113SVC', 'LaborRefusal_get', {
    body: JSON.stringify({
      PORM020113F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020113F1;
};

const saveRefusalNotice = async (body: object) => {
  const result = await Fetch.request('PORM020113SVC', 'save', {
    body: JSON.stringify({
      PORM020113F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const LaborRefusal_confirm = async (body: object) => {
  const result = await Fetch.request('PORM020113SVC', 'LaborRefusal_confirm', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const uploadFile = async (file, refNo, companyCode = 'HTNS') => {
  await CookieManager.clearAll();

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const finalFileName = file.fileName || `${refNo}${timestamp}`;

  const data = new FormData();
  data.append('COMPANY_CODE', companyCode);
  data.append('REF_NO', refNo);
  data.append('REF_TYPE', 'PT');
  data.append('S_FUNC_CODE', 'PT');
  data.append('JOB_NO', 'N');
  data.append('REMARKS', '');
  data.append('PUBLIC_YN', 'N');
  data.append('file', {
    uri: file.uri,
    type: file.type || 'application/octet-stream',
    name: finalFileName,
  } as any);

  const response = await fetch(`${fetchURL}/api/file/upload`, {
    method: 'POST',
    body: data,
    headers: {
      AJAX: 'true',
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      'X-CSRF-TOKEN': global.gToken,
      Cookie: global.gCookie,
    },
  });

  const result = await response.json();
  console.log('[uploadFile] response', JSON.stringify(result.data));

  if (result.TYPE !== 1) {
    throw new Error(result.MSG || '업로드 실패');
  }

  return result.data;
};

const deleteFile = async (
  fileMgtCode: string,
  yymmdd: string,
  refNo: string,
  fileName: string,
  companyCode: string = 'HTNS',
) => {
  const requestBody = {
    S_FUNC_CODE: 'PT',
    SEARCH_COMPANY_CODE: companyCode,
    FILE_MGT_CODE: fileMgtCode,
    YYMMDD: yymmdd,
    REF_NO: refNo,
    FILE_NAME: fileName,
    REF_TYPE: 'PT',
  };
  console.log('[deleteFile] request', JSON.stringify(requestBody));
  const response = await fetch(`${fetchURL}/api/file/delete`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      AJAX: 'true',
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      'X-CSRF-TOKEN': global.gToken,
      Cookie: global.gCookie,
    },
  });
  const result = await response.json();
  console.log('deleteFile result:', JSON.stringify(result));

  if (!result || result.TYPE === -1) {
    const msg = result?.MSG || '파일 삭제 실패';
    Util.toastMsg(msg, 'error');
    throw new Error(msg);
  }

  return result;
};

export {
  // 파일 삭제
  deleteFile,
  // 유저정보조회
  getEmpInfoM,
  // 통계 조회(정규출퇴근, 실제출퇴근시간)
  getInfoM,
  // 지원 리스트 조회
  getJobApplyList,
  // 공고 리스트 조회
  getJobPostList,
  LaborRefusal_confirm,
  LaborRefusal_get,
  // 연차촉진, 노무수령거부
  LaborRefusalNotice,
  LaborRefusalNotice2,
  // 입사지원
  save,
  saveRefusalNotice,
  // 파일 업로드
  uploadFile,
};
