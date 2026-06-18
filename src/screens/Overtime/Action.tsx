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

/**
 * 유저의 정규 출퇴근 정보 조회
 */
const getUserWSEInfo = async (body: object) => {
  const result = await Fetch.request('PORU010301SVC', 'getUserWSEInfo', {
    body: JSON.stringify({
      PORU010301F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010301F1;
};

const getAccumulatedHours = async (type: string, body: object) => {
  if (type === 'nd') {
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
  } else if (type === 'nc') {
    // 누적 시간
    const result = await Fetch.request('PORU010320SVC', 'weekTime', {
      body: JSON.stringify({
        PORU010320F1: body,
      }),
    });
    if (result.TYPE === -1) {
      Util.toastMsg(result.MSG, 'error');
    }
    return result.PORU010320F1[0];
  }
};

const calTime = async (body: object) => {
  const result = await Fetch.request('PORU010320SVC', 'calTime', {
    body: JSON.stringify({
      PORU010320F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010320F1[0];
};

const getDetailM = async (type: string, body: object) => {
  if (type === 'nd') {
    const result = await Fetch.request('PORU010301SVC', 'getDetailM', {
      body: JSON.stringify({
        PORU010301F1: body,
      }),
    });
    if (result.TYPE === -1) {
      Util.toastMsg(result.MSG, 'error');
    }
    return result.PORU010301F1;
  } else if (type === 'nc') {
    const result = await Fetch.request('PORU010320SVC', 'getDetailM', {
      body: JSON.stringify({
        PORU010320F1: body,
      }),
    });
    if (result.TYPE === -1) {
      Util.toastMsg(result.MSG, 'error');
    }
    return result.PORU010320F1;
  }
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

const getApproval33 = async (body: object) => {
  const result = await Fetch.request('PORU010320SVC', 'getApproval33', {
    body: JSON.stringify({
      PORU010320G33: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORU010320G33;
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
 */
const saveApproval = async (type: string, body1: object, body2: object) => {
  if (type === 'nd') {
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
  } else if (type === 'nc') {
    const result = await Fetch.request('PORU010320SVC', 'saveApproval', {
      body: JSON.stringify({
        PORU010320F23: body1, // 시간외 HD
        PORU010320G33: { data: body2 }, // 결재라인
      }),
    });
    if (result.TYPE === -1) {
      Util.toastMsg(result.MSG, 'error');
    }
    return result;
  }
};

/**
 * 회수
 */
const recall = async (type: string, body: object) => {
  let serviceName = 'PORU0103';
  if (type === 'nd') {
    serviceName += '01';
  } else if (type === 'nc') {
    serviceName += '20';
  }
  const result = await Fetch.request(`${serviceName}SVC`, 'Collect', {
    body: JSON.stringify({
      [`${serviceName}F23`]: body,
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
const deleteMobile = async (type: string, body: object) => {
  let serviceName = 'PORU0103';
  if (type === 'nd') {
    serviceName += '01';
  } else if (type === 'nc') {
    serviceName += '20';
  }
  const result = await Fetch.request(`${serviceName}SVC`, 'delete', {
    body: JSON.stringify({
      [`${serviceName}F312`]: body,
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
const recallForApprover = async (
  type: string,
  body1: object,
  body2: object,
) => {
  let serviceName = 'PORU0103';
  if (type === 'nd') {
    serviceName += '01';
  } else if (type === 'nc') {
    serviceName += '20';
  }
  const result = await Fetch.request(`${serviceName}SVC`, 'GCollect', {
    body: JSON.stringify({
      [`${serviceName}F1`]: body1,
      [`${serviceName}G1`]: {
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
const refusalForApprover = async (
  type: string,
  body1: object,
  body2: object,
) => {
  let serviceName = 'PORU0103';
  if (type === 'nd') {
    serviceName += '01';
  } else if (type === 'nc') {
    serviceName += '20';
  }
  const result = await Fetch.request(`${serviceName}SVC`, 'GApprovalCancel', {
    body: JSON.stringify({
      [`${serviceName}F1`]: body1,
      [`${serviceName}G1`]: {
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
const approveForApprover = async (
  type: string,
  body1: object,
  body2: object,
) => {
  let serviceName = 'PORU0103';
  if (type === 'nd') {
    serviceName += '01';
  } else if (type === 'nc') {
    serviceName += '20';
  }
  const result = await Fetch.request(`${serviceName}SVC`, 'GApproval', {
    body: JSON.stringify({
      [`${serviceName}F1`]: body1,
      [`${serviceName}G1`]: {
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
  calTime,
  deleteMobile,
  // 문서 기준의 주, 월 누적시간 조회
  getAccumulatedHours,
  // 결재라인 조회
  getApprLine,
  getApproval33,
  // 연장관련 사원정보 조회
  getClearInfo,
  // 상세 조회
  getDetailM,
  // 통계, 리스트 조회
  getInfoM,
  getListM,
  getUserWSEInfo,
  recall,
  recallForApprover,
  refusalForApprover,
  saveApproval,
};
