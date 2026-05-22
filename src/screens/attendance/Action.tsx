import { Fetch, Util } from '@/src/lib';

const getInfoM = async (body: object) => {
  // const result = await Fetch.request('PORM020201SVC', 'getMobileCalendar', {
  //   body: JSON.stringify({
  //     PORM020201F1: body,
  //   }),
  // });
  // if (result.TYPE === -1) {
  //   Util.toastMsg(result.MSG, 'error');
  // }
  // return result.PORM020201F1;
  const result = await Fetch.request('PORM020201SVC', 'getInfoM', {
    body: JSON.stringify({
      PORM020201F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020201F1;
};

const getNearOfficeM = async (body: object) => {
  const result = await Fetch.request('PORM020201SVC', 'getMobileDistance', {
    body: JSON.stringify({
      PORM020201F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020201F1;
};

const saveM = async (body: object) => {
  const result = await Fetch.request('PORM020201SVC', 'saveMobile2', {
    body: JSON.stringify({
      PORM020201F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  // 특정월의 출퇴근 관련 정보 조회
  getInfoM,
  // 가장 가까운 사무실 조회
  getNearOfficeM,
  // 저장(raw, 계산)
  saveM,
};
