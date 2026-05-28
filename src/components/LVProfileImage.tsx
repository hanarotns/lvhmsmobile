import * as icon from '@/src/assets/images';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const LVProfileImage = (props: any) => {
  const { path, imgStyle } = props;
  return (
    <Image
      style={{ width: 100, height: 100, borderRadius: 50, ...imgStyle }}
      source={
        path
          ? {
              uri: `https://lv1.htns.com/api/apicall/getDownload/${path}`,
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
