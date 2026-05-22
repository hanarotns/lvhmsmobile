import { Fetch, Util } from '@/src/lib';

const getPopup = async (groupCode: string, SQL: object) => {
  const result = await Fetch.request('COM050101SVC', 'getPopup', {
    body: JSON.stringify({
      groupCode,
      SQL,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.data;
};

const getCode = async (searchType: string, groupCode: string, SQL: object) => {
  const result = await Fetch.request('COM050101SVC', 'getCode', {
    body: JSON.stringify({
      searchType,
      groupCode,
      SQL,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.data;
};

export {
  getCode,
  // 공통코드 조회
  getPopup,
};
