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

const LVProfileImage = (props: any) => {
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
      style={{ width: 100, height: 100, borderRadius: 50, ...imgStyle }}
      source={
        path
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
export default LVProfileImage;

const styles = StyleSheet.create({});
