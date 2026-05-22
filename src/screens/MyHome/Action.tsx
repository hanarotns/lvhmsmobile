import { Fetch, Util } from '@/src/lib';

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
    body: JSON.stringify({
      PORM020113F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
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
};
