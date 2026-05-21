/* *
 * Import Common
 * */
import { BackIcon } from '@/src/components/Icons';
import { Fetch } from '@/src/lib';
import { AppStore } from '@/src/store';
import { Text, TopNavigation } from '@ui-kitten/components';
import React from 'react';
import { Alert, Dimensions, Image, StyleSheet } from 'react-native';
import env from '../lib/env';

import Icon from '@/src/components/Icon';
import * as RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';

// import { _, Util, Fetch, env, langUtil, bluecolor, Upload } from '@/src/libs';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const envConfig = env();
const fetchURL = envConfig.fetchURL;
// import { HBaseView, HRow, HTextfield, HTexttitle, Touchable, HIcon, HMapView, HText } from '@/src/componentss'

export default ({ navigation, route }) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const session = useRecoilValue(AppStore.sessionState);
  const { fileData } = route.params;
  console.log(fileData);
  const writeFlag =
    fileData.ADD_USER_ID === session.USER_ID || fileData.localFile;
  const onDeletePhoto = async () => {
    const title = '삭제';
    const msg = '이미지를 삭제하시겠습니까';
    const btnResult = await new Promise((resolve) => {
      Alert.alert(
        title,
        msg,
        [
          {
            text: '아니오',
            onPress: () => {
              resolve(false);
            },
          },
          {
            text: '예',
            onPress: () => {
              resolve(true);
            },
          },
        ],
        { cancelable: false },
      );
    });
    if (btnResult) {
      console.log(fileData);
      if (fileData.localFile) {
        RNFS.unlink(fileData.src);
      } else if (fileData.FILE_MGT_CODE) {
        await Fetch.request(
          'file',
          'delete',
          {
            body: JSON.stringify(fileData),
          },
          false,
        );
      }
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopNavigation
        accessoryLeft={() => <BackIcon navigation={navigation} />}
        alignment='center'
        title={() => <Text style={{}}>이미지</Text>}
        accessoryRight={
          writeFlag && (
            <Icon
              onPress={() => {
                onDeletePhoto();
              }}
              fill={'black'}
              style={{
                marginRight: 10,
              }}
              name='trash'
            />
          )
        }
      />
      <Image
        resizeMode={'contain'}
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '0deg' }],
        }}
        source={{
          uri: (fileData.localFile ? 'file://' : '') + fileData.src,
          headers: {
            'X-CSRF-TOKEN': global.gToken,
            Cookie: global.gCookie,
            // withCredentials: true,
          },
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  rotationLeftStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '3%',
    right: '10%',
  },
  rotationRightStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '3%',
    right: '0%',
  },
});
