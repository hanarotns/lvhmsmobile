/* *
 * Import Common
 * */
import Fetch from '@/src/lib/fetch';
// import ReduxStore from 'libs/store';
import messaging from '@react-native-firebase/messaging';

/**
 * 푸쉬메세지 관련 라이브러리
 */

export const initPushNotification = () => {
  // const session = useRecoilState(AppStore.sessionState);

  messaging()
    .getToken()
    .then((token) => {
      updateToken(token);
      messaging().subscribeToTopic('SLPMB');
    });

  // messaging().onMessage(async remoteMessage => {
  //   const room_id = global.ROOM_ID;
  //   const alram_yn = 'Y';

  //   console.log('A new FCM message arrived!'+ JSON.stringify(remoteMessage));
  //   console.log('global.ROOM_ID ', global.ROOM_ID)

  //   if (Platform.OS === 'ios') {
  //     Util.toastMsg(this.title);
  //     if (ALRAM_YN === 'Y') {
  //       RNBeep.PlaySysSound(RNBeep.iOSSoundIDs.AudioToneBusy);
  //     }
  //     // ios에서 수신시 계속 시스템알림 발생 JKM 2019/12/26
  //     notif.finish();
  //   } else {
  //     if (this.title !== undefined || this.title != null) {
  //       Util.toastMsg(`${notif.fcm.title}\n${notif.fcm.body}`);
  //     }
  //     if (ALRAM_YN === 'Y') {
  //       RNBeep.PlaySysSound(RNBeep.AndroidSoundIDs.TONE_CDMA_CALL_SIGNAL_ISDN_PING_RING);
  //     }
  //   }
  //   Vibration.vibrate(1000);
  // });
  // messaging().setBackgroundMessageHandler(async (notif) => {
  //   // Toast.showWithGravity( 'Message handled in the background!'+ JSON.stringify(notif), Toast.LONG, Toast.TOP);
  //   //  여기에 로직을 작성한다.
  //   //  remoteMessage.data로 메세지에 접근가능
  //   //  remoteMessage.from 으로 topic name 또는 message identifier
  //   //  remoteMessage.messageId 는 메시지 고유값 id
  //   //  remoteMessage.notification 메시지와 함께 보내진 추가 데이터
  //   //  remoteMessage.sentTime 보낸시간
  // });
};
// http://127.0.0.1:8080/api/VTX010101SVC/appUserToken
/*
{
"APP_ID": "g1mb",
"MOBILE_TOKEN": "xMbXmhBanR2UOk1m1xKGt9vzndMdGBmy"
}
*/
// const api = 'http://127.0.0.1:8080/api/VTX010101SVC/appUserToken';
const updateToken = async (token) => {
  //  await Cookie.clear().then(res => {
  Fetch.updatePushToken(token);
  //  });
};

const deleteToken = async () => {
  //  await Cookie.clear().then(res => {
  Fetch.updatePushToken(null);
  //  });
  FCM.unsubscribeFromTopic('/topics/SLPMB');
};
