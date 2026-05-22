import {Util, Fetch} from '~/lib';

const getMyApprLine = async (body: object) => {
  const result = await Fetch.request('PORX010700SVC', 'getInfoM', {
    body: JSON.stringify({
      PORX010700F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result.PORX010700G1;
};

const saveMobile = async (body1: object, body2: object) => {
  const result = await Fetch.request('PORX010700SVC', 'saveMobile', {
    body: JSON.stringify({
      PORX010700F1: body1,
      PORX010700G1: {data: body2},
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

const deleteM = async (body: object) => {
  const result = await Fetch.request('PORX010700SVC', 'deleteMobile', {
    body: JSON.stringify({
      PORX010700F1: body,
    }),
  });
  if (result.TYPE === -1) {
    Util.toastMsg(result.MSG, 'error');
  }
  return result;
};

export {
  // (개인별 결재선 추가를 위한) 멤버 리스트 조회
  // getUserList,
  // 개인별 결재선 리스트 조회
  getMyApprLine,
  // 개인별 결재선 저장
  // save,
  // saveDetail,
  saveMobile,
  // 개인별 결재선 삭제
  deleteM,
};
