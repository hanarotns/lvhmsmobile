import { Fetch, Util } from '@/src/lib';

const getInfoM = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getInfoM', {
    body: JSON.stringify({
      PORU010302F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302F1;
};

const getPTHR_DGMD = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getPTHR_DGMD', {
    body: JSON.stringify({
      PORU010302F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302G1;
};

const getListM = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getListM', {
    body: JSON.stringify({
      PORU010302F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302G1;
};

const getDetailM = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getDetailM', {
    body: JSON.stringify({
      PORU010302F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302F1;
};

const getDt = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getDetail35', {
    body: JSON.stringify({
      PORU010302G1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302G35;
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

const getClearInfo = async (body) => {
  const result = await Fetch.request('PORU010302SVC', 'getClearInfo', {
    body: JSON.stringify({
      PORU010302F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302F23;
};

/**
 * 상신
 * @param body1
 * @param body2
 * @param body3
 * @returns
 */
const saveApproval = async (body1: object, body2: object, body3: object) => {
  const result = await Fetch.request('PORU010302SVC', 'saveApproval', {
    body: JSON.stringify({
      PORU010302F236: body1, // 휴가원HD
      PORU010302G35: { data: body2 }, // 휴가원DT
      PORU010302G33: { data: body3 }, // 결재라인
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
  const result = await Fetch.request('PORU010302SVC', 'Collect', {
    body: JSON.stringify({
      PORU010302F236: body,
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
  const result = await Fetch.request('PORU010302SVC', 'delete', {
    body: JSON.stringify({
      PORU010302F236: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 휴가DT 삭제
 * @param body
 * @returns
 */
const deleteRow = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'deleterow', {
    body: JSON.stringify({
      PORU010302G35: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  deleteMobile,
  deleteRow,
  getApprLine,
  getClearInfo,
  getDetailM,
  getDt,
  getInfoM,
  getListM,
  getPTHR_DGMD,
  recall,
  saveApproval,
};
