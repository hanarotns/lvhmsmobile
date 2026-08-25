import { Fetch, Util } from '@/src/lib';

const getInfoM = async (body: object) => {
  const result = await Fetch.request('PORU010104SVC', 'getInfoM', {
    body: JSON.stringify({
      PORU010104F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010104F1;
};

// @@ 신규 정의 필요
// PORU010103SVC/get, PORU010104SVC/get 와 유사.
const getListM = async (body: object) => {
  const result = await Fetch.request('PORU010104SVC', 'getListM', {
    body: JSON.stringify({
      PORU010104F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010104G1;
};

export {
  // 통계, 리스트 조회
  getInfoM,
  getListM,
};
