import { Fetch, Util } from '@/src/lib';

const getInfoM = async (body: object) => {
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

const saveBeaconM = async (body: object) => {
  const result = await Fetch.request('PORM020201SVC', 'saveBeaconM', {
    body: JSON.stringify({
      PORM020201G1: {
        data: body,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const getCurrentBeaconRecordM = async (body: object) => {
  const result = await Fetch.request(
    'PORM020201SVC',
    'getCurrentBeaconRecordM',
    {
      body: JSON.stringify({
        PORM020201F1: body,
      }),
    },
  );
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORM020201F1;
};

export {
  // 최근 비콘으로 등록된 기록 조회
  getCurrentBeaconRecordM,
  // 특정월의 출퇴근 관련 정보 조회
  getInfoM,
  // 가장 가까운 사무실 조회
  getNearOfficeM,
  // 비콘정보 저장
  saveBeaconM,
  // 저장(raw, 계산)
  saveM,
};
