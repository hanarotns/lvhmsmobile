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

const getApprLineM = async (body: object) => {
  const result = await Fetch.request('PORU010399SVC', 'getApprLineM', {
    body: JSON.stringify({
      PORU010399F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010399G1;
};

export { getApprLine, getApprLineM, getCode, getPopup };
