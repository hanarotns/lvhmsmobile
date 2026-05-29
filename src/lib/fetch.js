import env from '@/src/lib/env';
import Util from '@/src/lib/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import _ from 'lodash';
import { Alert, Image } from 'react-native';
// import ImageResizer from 'react-native-image-resizer';

const envConfig = env();
let fetchURL = envConfig.fetchURL;
const settingUrl = async () => {
  fetchURL = await AsyncStorage.getItem('url');
};
settingUrl();

const request = async (code, method, config, toastYN) => {
  fetchURL = await AsyncStorage.getItem('url');
  try {
    //    await Cookie.clear();
    await CookieManager.clearAll();
    const options = {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': global.gToken,
        Accept: 'application/json',
        AJAX: true,
        Cookie: global.gCookie,
        'User-Agent': 'okhttp/3.4.1',
        'Content-Type': 'application/json;charset=UTF-8',
        credentials: 'omit',
        // withCredentials: true,
      },
      body: config.body || null,
    };

    if (fetchURL.indexOf('https') > -1) {
      options.sslPinning = {
        cert: 'mycert',
      };
    }

    const response = await fetch(`${fetchURL}/api/${code}/${method}`, options);
    const responseJson = await response.json();
    console.log(
      '\n🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡\n',
      ` ${code}/${method}`,
      '\n------------------------------------------------------------\n',
      config.body,
      '\n------------------------------------------------------------\n',
      responseJson,
      '\n💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙\n',
    );
    const msg = _.get(responseJson, 'MSG');
    if (_.has(responseJson, 'TYPE')) {
      const type = _.get(responseJson, 'TYPE');
      if (type === 200111 || type === 200130 || type === 403) {
        // @@ 에러처럼 보여서 일단 삭제
        if (type === 200130) {
          return;
        }
        Util.toastMsg(msg);
        return;
      }
    }
    return responseJson;
  } catch (error) {
    console.error(error);
    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(error)) {
      Util.toastMsg(error);
    }
  }
};

const getInit = async () => {
  fetchURL = await AsyncStorage.getItem('url');
  const result = await request('G1E000000SVC', 'getInitG1M', {
    body: JSON.stringify({
      WINS: {},
    }),
  });
  if (result) {
    return result.data;
  }
  return null;
};

const preCheckSignIn = async () => {
  fetchURL = await AsyncStorage.getItem('url');
  let result = true;
  if (Platform.OS === 'android') {
    result = await Util.permissionChkFunc();
  }
  if (!result) {
    Util.toastMsg('요청한 모든 권한을 설정해야 사용할 수 있습니다.');
    return null;
  }
  const passed = await Util.checkIsToken();
  const sessionData = await getInit();

  if (passed && sessionData) {
    return sessionData.session;
  }
  return null;
};

const tokenHttp = async () => {
  fetchURL = await AsyncStorage.getItem('url');
  try {
    let localcookie = null;
    await AsyncStorage.getItem('cookie', (err, result) => {
      if (result) {
        localcookie = result;
      }
    });
    // 거짓 데이터를 토큰을 발급받기 위해 보낸다.
    // 제대로 처리가 이루어져도 아래와 같은 에러를 발생한다.
    // Invalid CSRF Token 'Global No1 HTNS' was found on …quest parameter '_csrf' or header 'X-CSRF-TOKEN'.
    const response = await fetch(`${fetchURL}/htns_sec`, {
      // const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': 'Global No1 HTNS',
        AJAX: true,
        Cookie: localcookie,
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: 'USER_ID=tokenfix&PW=tokenfix',
    });
    // console.log('response', response)
    const responseJson = await response.json();
    console.log('tokenHttp', response, responseJson);
    return responseJson;
  } catch (error) {
    // Util.toastMsg(JSON.stringify(err))
    Alert.alert('인터넷 연결 확인', `${error}`, [{ text: '확인' }], {
      cancelable: false,
    });
    return false;
  }
};

const loginHttp = async (csrf, id, password) => {
  fetchURL = await AsyncStorage.getItem('url');
  // ! * ' ( ) ; : @ & = + $ , / ? # [ ]
  // GET 방식으로 파라미터 전달시 &와 + 기호는 전달되지 않는다.
  // 로컬에서 데이터를 전달하는 시점에 + 기호를 공백으로 변경하여 전달한다.
  // 출처: https://118k.tistory.com/42 [개발자로 살아남기]
  const sBody = `_csrf=${csrf}&USER_ID=${id}&PW=${encodeURIComponent(
    password,
  )}&_spring_security_remember_me=${false}`;
  try {
    const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': csrf,
        AJAX: true,
        Cookie: global.gCookie, // ios 토근 오류로 인해 주석처리!
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: sBody,
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });
    // Util.toastMsg('resToken :::: '+response.headers.get('set-cookie').toString())
    // console.log('response :::: ', response.headers.get('set-cookie').toString())
    await AsyncStorage.setItem(
      'cookie',
      response.headers.get('set-cookie').toString(),
    );
    // NOTE: DEBUG
    const responseJson = await response.json();
    const resCookie = await _.get(responseJson, 'SetCookie');
    console.log('loginHttp', response, responseJson);
    // 이상하게 response 헤더 cookie값이 짤려서 강제로 넣음 로컬 환경에서는 넣지 않는다.
    if (
      resCookie &&
      (fetchURL.indexOf('192') > 0 || fetchURL.indexOf('172') > 0)
    ) {
      await AsyncStorage.setItem('cookie', resCookie);
    }

    const resToken = _.get(responseJson, 'signaldata.X-CSRF-TOKEN');
    await AsyncStorage.setItem('token', resToken);

    global.gToken = resToken;
    global.gCookie = response.headers.get('set-cookie').toString();

    // global.gCookie = resCookie;
    if (global.gCookie.indexOf('JSESSIONID') < 0 && responseJson.sessionId) {
      global.gCookie = `X-CSRF-TOKEN=${
        global.gToken
      }; Path=/;JSESSIONID=${responseJson.sessionId.substr(
        responseJson.sessionId.indexOf('SessionId: ') + 11,
      )}; Path=/; ${global.gCookie}`;
      await AsyncStorage.setItem('cookie', global.gCookie);
    }

    return responseJson;
  } catch (error) {
    Alert.alert(
      '인터넷 연결 확인',
      `Network request failed${error}`,
      [{ text: '확인' }],
      {
        cancelable: false,
      },
    );
    return false;
  }
};

const logout = async () => {
  fetchURL = await AsyncStorage.getItem('url');
  try {
    const response = await fetch(`${fetchURL}/j_spring_security_logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': global.gToken,
        AJAX: true,
        Cookie: global.gCookie,
      },
    });

    await AsyncStorage.removeItem('cookie');
    await AsyncStorage.removeItem('token');
    // await AsyncStorage.removeItem('loginPwd'); // 비밀번호 remove 해제
    return response;
  } catch (error) {
    console.error(error);
  }
};

/**
 * 공통 코드
 *
 * @returns
 */
const getCommonCode = async (option) => {
  fetchURL = await AsyncStorage.getItem('url');
  const result = await request(
    'SMS070010SVC',
    'getCode',
    {
      body: JSON.stringify(option),
    },
    'N',
  );
  // Util.toastMsg(result.MSG);
  return result;
};

const updatePushToken = async (mobileToken) => {
  fetchURL = await AsyncStorage.getItem('url');
  const result = await request('VTX010101SVC', 'appUserToken', {
    body: JSON.stringify({
      APP_ID: 'G1MB',
      MOBILE_TOKEN: mobileToken,
    }),
  });
  // @todo : 결과 문제 있음 확인할 것.  DESC: "The value of this argument does not exist."
  // MSG: "정상적으로 처리되었습니다."
  // console.log('appUserToken :::: ', result)
  return result;
};

const getFileList = async (item) => {
  fetchURL = await AsyncStorage.getItem('url');
  const result = await request(
    'file',
    'getList',
    {
      body: JSON.stringify(item),
    },
    false,
  );

  return result;
};

const upload = async ({
  companyCode,
  refNo,
  refType,
  sFuncCode,
  fileConfig,
  onProgress,
  onSuccess,
  onError,
}) => {
  fetchURL = await AsyncStorage.getItem('url');
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
  // if (fileSize > 5242880) {
  //     // 5mb : 5242880b, 4mb : 4194304, 3mb : 3145728b
  //     const alertMsg =
  //         '파일사이즈가 허용 범위를 초과하였습니다.\nThe file size exceeds the allowable range.\n(Less than 5MB available!)';
  //     Util.toastMsg(alertMsg);
  //     onError(alertMsg);
  // }
  // await Cookie.clear();
  await CookieManager.clearAll();
  await ImageResizer.createResizedImage(
    fileUri,
    resizeWidth,
    resizeHeight,
    'JPEG',
    resizeQuality,
    rotation,
    null,
  )
    .then((response) => {
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
          (progressEvent) => {
            const progress = progressEvent.loaded / progressEvent.total;
            onProgress(progress);
          },
        ).then(onSuccess, onError);
      } catch (error) {
        onError(error);
      }
    })
    .catch((err) => {
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
    });
};

const forceLogout = async (phoneno, password) => {
  fetchURL = await AsyncStorage.getItem('url');
  console.log(
    'fetch-log',
    'forceLogout',
    `${fetchURL}/api/apicall/forceLogOut/${phoneno}/${encodeURIComponent(
      password,
    )}`,
  );
  const response = await fetch(
    `${fetchURL}/api/apicall/forceLogOut/${phoneno}/${encodeURIComponent(
      password,
    )}`,
  );
  console.log('fetch-log', 'forceLogout', 'result', response);

  return response;
};

const fetchCommonCode = async (groupCode, SQL) => {
  fetchURL = await AsyncStorage.getItem('url');
  const result = await request('COM050101SVC', 'getCode', {
    body: JSON.stringify({
      groupCode,
      SQL,
    }),
  });

  return result;
};

export default {
  // upload,
  getFileList,
  getCommonCode,
  logout,
  loginHttp,
  preCheckSignIn,
  getInit,
  request,
  tokenHttp,
  updatePushToken,
  forceLogout,
  fetchCommonCode,
};
