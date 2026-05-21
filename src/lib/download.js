import CookieManager from '@react-native-cookies/cookies';

import Fetch from './fetch';
import futch from './futch';

const download = async ({
  companyCode,
  sFuncCode,
  fileMgtCode,
  // token,
  onProgress,
  onSuccess,
  onError,
}) => {
  const data = new FormData();
  data.append('COMPANY_CODE', companyCode); // you can append anyone.
  data.append('SEARCH_COMPANY_CODE', companyCode); // you can append anyone.
  data.append('S_FUNC_CODE', sFuncCode); // you can append anyone.
  data.append('FILE_MGT_CODE', fileMgtCode); // you can append anyone.

  CookieManager.clearAll();

  try {
    CookieManager.clearAll();

    const resDownload = await futch(
      `${Fetch.fetchURL}/api/file/download`,
      {
        method: 'post',
        body: data,
        headers: {
          AJAX: true,
          Accept: 'application/octet-stream; charset=UTF-8',
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': global.gToken,
          Cookie: global.gCookie,
        },
      },
      (progressEvent) => {
        const progress = progressEvent.loaded / progressEvent.total;
        onProgress(progress);
      },
    );

    const responseJson = null; // await resDownload.json();
    onSuccess(resDownload, responseJson);
  } catch (error) {
    onError(error);
  }
};

export default download;
