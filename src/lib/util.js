import Toast from 'react-native-toast-message';

const isEmpty = (value) => {
  if (
    value === '' ||
    value === null ||
    value === undefined ||
    (value != null && typeof value === 'object' && !Object.keys(value).length)
  ) {
    return true;
  }
  return false;
};

const toastMsg = (message, type) => {
  let config = message;
  if (typeof message === 'string') {
    config = {
      text1: message,
      visibilityTime: 3000,
      position: 'bottom',
      type,
    };
  } else {
    config = {
      text1: message.title,
      text2: message.msg,
      visibilityTime: 3000,
      position: 'bottom',
    };
  }

  Toast.show(config);
};
const convertDateTime = (date, time) => {
  let result = '';

  // 날짜 체크
  if (/^\d{8}$/.test(date)) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    if (+month >= 1 && +month <= 12 && +day >= 1 && +day <= 31) {
      result = `${year}-${month}-${day}`;
    }
  }

  // 시간 체크
  if (/^\d{4}$/.test(time)) {
    const hour = +time.substring(0, 2);
    const min = +time.substring(2, 4);

    if (hour >= 0 && hour < 24 && min >= 0 && min < 60) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(
        2,
        '0',
      )}`;
      result = result ? `${result} ${timeStr}` : timeStr;
    }
  }

  return result;
};

export default {
  isEmpty,
  toastMsg,
  convertDateTime,
};
