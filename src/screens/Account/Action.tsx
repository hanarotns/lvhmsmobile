import { Fetch, Util } from '@/src/lib';

// @@ 신규 정의 필요
// PORA010101SVC/get 와 유사
// 조회한 연월에 대한 급여만을 보여주어야 함.
// 급여지급일 컬럼 없음
// 없는 컬럼들이 있음...!
const getDetailM = async (body: object) => {
  const result = await Fetch.request('PORA010101SVC', 'getDetailM', {
    body: JSON.stringify({
      PORA010101F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORA010101F1;
};

export {
  // 급여리스트 조회
  getDetailM,
};
