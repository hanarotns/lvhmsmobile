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
    // return;
  }
  const reulst2 = await Fetch.request('PORU010301SVC', 'accrueTime', {
    body: JSON.stringify({
      PORU010301F1: body,
      ...result1.PORU010301F1['0'],
    }),
  });
  return reulst2.PORU010301F1['0'];
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

// @@ 신규 정의 필요(calTiem, accrueTime)
// 상신, 회수, 삭제, 재상신 모두 분할 되어 있음
const save = async (body: object) => {
  const result = await Fetch.request('HMSOVT010SVC', 'save', {
    body: JSON.stringify(body),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  // 문서 기준의 주, 월 누적시간 조회
  getAccumulatedHours,
  // 결재라인 조회
  getApprLine,
  // 상세 조회
  getDetailM,
  // 통계, 리스트 조회
  getInfoM,
  getListM,
  // 신청: 상신 / 상세: 회수, 삭제, 재상신
  save,
};
