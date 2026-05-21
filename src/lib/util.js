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

export default {
  isEmpty,
  toastMsg,
};
