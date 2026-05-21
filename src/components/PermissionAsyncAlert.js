import { Linking, Alert } from 'react-native';
const message = 'Please Go into Settings -> Applications -> APP_NAME -> You need permission for Location and Camera.';

const PermissionAsyncAlert = async () => new Promise((resolve) => {
  Alert.alert(
    'Please, Check Permissions!',
    message,
    [{
      text: 'OK', onPress: () => {
        Linking.openSettings();
        resolve(true);
      }
    },
    ],
    {
      cancelable: false,
    },
  )
});
export default PermissionAsyncAlert;