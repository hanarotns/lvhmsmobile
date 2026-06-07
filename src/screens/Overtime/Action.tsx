import { Fetch, Util } from '@/src/lib';

const getInfoM = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'getInfoM', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010301F1;
};

const getListM = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'getListM', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010301G1;
};

const getAccumulatedHours = async (body: object) => {
  const result1 = await Fetch.request('PORU010301SVC', 'calTime', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result1.TYPE === -1) {
    Util.toastMsg(result1.MSG, 'error');
    return;
  }
  const reulst2 = await Fetch.request('PORU010301SVC', 'accrueTime', {
    body: JSON.stringify({
      PORU010301F1: {
        ...body,
        ...result1.PORU010301F1[0],
      },
    }),
  });
  if (result1.TYPE === -1) {
    Util.toastMsg(result1.MSG, 'error');
  }
  return reulst2.PORU010301F1[0];
};

const getDetailM = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'getDetailM', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010301F1;
};

const getApprLine = async (body: object) => {
  const result = await Fetch.request('PORU010399SVC', 'get', {
    body: JSON.stringify({
      PORU010399F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010399G1;
};

const getClearInfo = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'getClearInfo', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010301F23[0];
};

/**
 * 상신
 * @param body1
 * @param body2
 * @returns
 */
const saveApproval = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010301SVC', 'saveApproval', {
    body: JSON.stringify({
      PORU010301F23: body1, // 시간외 HD
      PORU010301G33: { data: body2 }, // 결재라인
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 회수
 * @param body
 * @returns
 */
const recall = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'Collect', {
    body: JSON.stringify({
      PORU010301F23: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 삭제
 * @param body
 * @returns
 */
const deleteMobile = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'delete', {
    body: JSON.stringify({
      PORU010301F312: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  deleteMobile,
  // 문서 기준의 주, 월 누적시간 조회
  getAccumulatedHours,
  // 결재라인 조회
  getApprLine,
  // 연장관련 사원정보 조회
  getClearInfo,
  // 상세 조회
  getDetailM,
  // 통계, 리스트 조회
  getInfoM,
  getListM,
  recall,
  saveApproval,
};
