import {Util, _} from '~/lib';
import {Image} from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
//import Cookie from 'react-native-cookie';
import ImageResizer from 'react-native-image-resizer';
import env from '../lib/env';
import {Fetch} from '~/lib';

const envConfig = env();
const fetchURL = envConfig.fetchURL;

export const getFileList = async item => {
  if (!item.REF_NO) {
    return null;
  }
  const result = await Fetch.request(
    'file',
    'getList',
    {
      body: JSON.stringify(item),
    },
    false,
  );
  if (result) {
    return result;
  }
  return {};
};

export const upload = async ({
  companyCode,
  refNo,
  refType,
  sFuncCode,
  fileConfig,
  onProgress,
  onSuccess,
  onError,
}) => {
  const fileUri = fileConfig.fileUri;
  const fileType = fileConfig.fileType;
  const fileName = fileConfig.fileName;
  // const { config } = ReduxStore.getState().global;

  // 이미지 사이즈(가로, 세로) 정보
  await Image.getSize(fileUri, (width, height) => {});

  const fileSize = fileConfig.fileSize;

  let finalFile = fileUri;
  // let rotation = config.ROTATION === 'Y' ? 0 : 90;
  let rotation = 0; // 세로사진을 갤러리 이용시 그대로
  const resizeWidth = 800;
  const resizeHeight = 600;
  const resizeQuality = 80;
  // let resizeKeepMeta = false;
  if (fileUri.indexOf('root') > -1) {
    // 세로사진을 카메라 이용시 90도 회전,
    rotation = 90;
  }

  // 파일사이즈 허용! 5MB 이하만!
  if (fileSize > 5242880) {
    // 5mb : 5242880b, 4mb : 4194304, 3mb : 3145728b
    const alertMsg =
      '파일사이즈가 허용 범위를 초과하였습니다.\nThe file size exceeds the allowable range.\n(Less than 5MB available!)';
    Util.toastMsg(alertMsg);
    onError(alertMsg);
  }
  await CookieManager.clearAll();
  //await Cookie.clear();
  await ImageResizer.createResizedImage(
    fileUri,
    resizeWidth,
    resizeHeight,
    'JPEG',
    resizeQuality,
    rotation,
    null,
  )
    .then(response => {
      finalFile = response;
      const year = new Date().getFullYear(); // Current Year
      let month = new Date().getMonth() + 1; // Current Month
      if (month.toString().length === 1) {
        month = `0${month}`;
      }
      const date = new Date().getDate(); // Current Date
      const hour = new Date().getHours(); // Current Hours
      const min = new Date().getMinutes(); // Current Minutes
      const sec = new Date().getSeconds(); // Current Seconds
      // const dateSet = Util.getDividedDateSet();
      // const currentDate = `_${dateSet.year}${dateSet.month}${dateSet.day}${dateSet.hour}${dateSet.min}${dateSet.sec}`;
      const currentDate = `_${year}${month}${date}${hour}${min}${sec}`;
      const finalFileName = fileName || `${refNo + currentDate}.png`;

      const data = new FormData();
      data.append('COMPANY_CODE', companyCode); // you can append anyone.
      data.append('REF_NO', refNo); // you can append anyone.
      data.append('REF_TYPE', refType); // you can append anyone.
      data.append('S_FUNC_CODE', sFuncCode); // you can append anyone.
      data.append('JOB_NO', 'N'); // you can append anyone.
      data.append('REMARKS', ''); // you can append anyone.
      data.append('PUBLIC_YN', 'N'); // you can append anyone.
      data.append('AUTH_TYPE', ''); // you can append anyone.
      data.append('file', {
        // HPhotoView에서 넘어올경우 finalFile안에 uri 존재!
        uri: Util.isEmpty(finalFile.uri) ? finalFile : finalFile.uri,
        type: 'image/png', // or photo.type
        name: finalFileName, // `${refNo + currentDate}.png`,
      });
      try {
        fetch(
          `${fetchURL}/api/file/upload`,
          {
            method: 'post',
            body: data,
            headers: {
              AJAX: true,
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
              'X-CSRF-TOKEN': global.gToken,
              Cookie: global.gCookie,
            },
          },
          progressEvent => {
            const progress = progressEvent.loaded / progressEvent.total;
            onProgress(progress);
          },
        ).then(onSuccess, onError);
      } catch (error) {
        onError(error);
      }
    })
    .catch(err => {
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
      console.log('ImageResizer.createResizedImage Error', err);
    });
};
