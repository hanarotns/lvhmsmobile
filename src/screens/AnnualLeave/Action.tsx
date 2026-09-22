import { Fetch, Util } from '@/src/lib';
import { Alert } from 'react-native';

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

const getApproval33 = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'getApproval33', {
    body: JSON.stringify({
      PORU010302G33: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010302G33;
};

const getClearInfo = async (body: object) => {
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
    Alert.alert('알림', result.MSG);
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 회수
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
 */
const deleteRow = async (body: object) => {
  const result = await Fetch.request('PORU010302SVC', 'deleterow', {
    body: JSON.stringify({
      PORU010302G35: {
        data: body,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 회수 (결재자)
 */
const recallForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010302SVC', 'GCollect', {
    body: JSON.stringify({
      PORU010302F1: body1,
      PORU010302G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 반려 (결재자)
 */
const refusalForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010302SVC', 'GApprovalCancel', {
    body: JSON.stringify({
      PORU010302F1: body1,
      PORU010302G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 결재 (결재자)
 */
const approveForApprover = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010302SVC', 'GApproval', {
    body: JSON.stringify({
      PORU010302F1: body1,
      PORU010302G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 변경취소 시, 조회
 */
const getOfChange = async (body: object) => {
  const result = await Fetch.request('PORU010303SVC', 'get', {
    body: JSON.stringify({
      PORU010303F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010303F3126[0];
};

/**
 * 변경취소 시, 휴가원DT조회
 */
const getDtOfChange = async (body: object) => {
  const result = await Fetch.request('PORU010303SVC', 'getDetail35', {
    body: JSON.stringify({
      PORU010303G1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010303G35;
};

/**
 * 변경취소 시, 상신
 */
const saveApprovalOfChange = async (
  body1: object,
  body2: object,
  body3: object,
) => {
  const result = await Fetch.request('PORU010303SVC', 'save', {
    body: JSON.stringify({
      PORU010303F3126: body1, // 휴가원HD
      PORU010303G35: { data: body2 }, // 휴가원DT
      PORU010303G33: { data: body3 }, // 결재라인
    }),
  });
  if (result.TYPE === -1) {
    Alert.alert('알림', result.MSG);
  }
  return result;
};

const getInfoMOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'getInfoM', {
    body: JSON.stringify({
      PORU010304F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304F1;
};

const getListMOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'getListM', {
    body: JSON.stringify({
      PORU010304F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304G1;
};

const getTimelineMOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'getTimelineM', {
    body: JSON.stringify({
      PORU010304F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304G1;
};

const getDetailMOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'getDetailM', {
    body: JSON.stringify({
      PORU010304F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304F1;
};

const getDtOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'getDetail35', {
    body: JSON.stringify({
      PORU010304G1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304G35;
};

const getClearInfoOfSchedule = async (body) => {
  const result = await Fetch.request('PORU010304SVC', 'getClearInfo', {
    body: JSON.stringify({
      PORU010304F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010304F23;
};

/**
 * 연차사용예정(연차사용계획) 시, 상신
 */
const saveApprovalOfSchedule = async (
  body1: object,
  body2: object,
  body3: object,
) => {
  const result = await Fetch.request('PORU010304SVC', 'saveApproval', {
    body: JSON.stringify({
      PORU010304F236: body1, // 휴가원HD
      PORU010304G35: { data: body2 }, // 휴가원DT
      PORU010304G33: { data: body3 }, // 결재라인
    }),
  });
  if (result.TYPE === -1) {
    Alert.alert('알림', result.MSG);
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 회수
 */
const recallOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'Collect', {
    body: JSON.stringify({
      PORU010304F236: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 삭제
 */
const deleteMobileOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'delete', {
    body: JSON.stringify({
      PORU010304F236: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 휴가DT 삭제
 */
const deleteRowOfSchedule = async (body: object) => {
  const result = await Fetch.request('PORU010304SVC', 'deleterow', {
    body: JSON.stringify({
      PORU010304G35: {
        data: body,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 회수 (결재자)
 */
const recallForApproverOfSchedule = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010304SVC', 'GCollect', {
    body: JSON.stringify({
      PORU010304F1: body1,
      PORU010304G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 반려 (결재자)
 */
const refusalForApproverOfSchedule = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010304SVC', 'GApprovalCancel', {
    body: JSON.stringify({
      PORU010304F1: body1,
      PORU010304G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

/**
 * 연차사용예정(연차사용계획) 시, 결재 (결재자)
 */
const approveForApproverOfSchedule = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORU010304SVC', 'GApproval', {
    body: JSON.stringify({
      PORU010304F1: body1,
      PORU010304G1: {
        data: body2,
      },
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  approveForApprover,
  approveForApproverOfSchedule,
  deleteMobile,
  deleteMobileOfSchedule,
  deleteRow,
  deleteRowOfSchedule,
  getApproval33,
  getClearInfo,
  getClearInfoOfSchedule,
  getDetailM,
  getDetailMOfSchedule,
  getDt,
  getDtOfChange,
  getDtOfSchedule,
  getInfoM,
  getInfoMOfSchedule,
  getListM,
  getListMOfSchedule,
  getOfChange,
  getPTHR_DGMD,
  getTimelineMOfSchedule,
  recall,
  recallForApprover,
  recallForApproverOfSchedule,
  recallOfSchedule,
  refusalForApprover,
  refusalForApproverOfSchedule,
  saveApproval,
  saveApprovalOfChange,
  saveApprovalOfSchedule,
};
