import * as icon from '@/src/assets/images';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { Image } from 'expo-image';

import env from '@/src/lib/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const envConfig = env();
let fetchURL = envConfig.fetchURL;
const settingUrl = async () => {
  fetchURL = await AsyncStorage.getItem('url');
};
settingUrl();

const LVImage = (props: any) => {
  const { path, imgStyle } = props;

  useEffect(() => {
    func();
  }, []);

  const func = async () => {
    fetchURL = await AsyncStorage.getItem('url');
    return fetchURL;
  };

  const tempURL = `${fetchURL}/api/file/getDownload/${path}`;

  return (
    <Image
      style={{ ...imgStyle }}
      source={
        tempURL
          ? {
              uri: tempURL,
              headers: {
                'X-CSRF-TOKEN': global.gToken,
                Cookie: global.gCookie,
                // withCredentials: true,
              },
            }
          : icon.ico_profile
      }
    />
  );
};
export default LVImage;

const styles = StyleSheet.create({});
