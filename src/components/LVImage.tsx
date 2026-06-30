import { Dimensions, StyleSheet, Text, View } from 'react-native';

import * as icon from '@/src/assets/images';
import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import React, { useEffect } from 'react';

import env from '@/src/lib/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import LVButton from './LVButton';

const envConfig = env();
let fetchURL = envConfig.fetchURL;
const settingUrl = async () => {
  fetchURL = await AsyncStorage.getItem('url');
};
settingUrl();

const LVImage = (props: any) => {
  const { currentFile, imgStyle } = props;

  useEffect(() => {
    func();
  }, []);

  const height = Dimensions.get('window').height * 0.7;

  const func = async () => {
    fetchURL = await AsyncStorage.getItem('url');
    return fetchURL;
  };
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  const getFileExt = (fileName?: string) => {
    return fileName?.split('.').pop()?.toLowerCase();
  };

  const isImageFile = (fileName?: string) => {
    const ext = getFileExt(fileName);
    return ext ? imageExtensions.includes(ext) : false;
  };
  const fileName = currentFile?.FILE_NAME ?? 'download-file.pdf';
  const filePath = `${currentFile?.COMPANY_CODE}/${currentFile?.S_FUNC_CODE}/${currentFile?.FILE_MGT_CODE}`;
  const isImage = isImageFile(fileName);

  const downloadUrl = `${fetchURL}/api/file/getDownload/${filePath}`;
  const downloadFile = async () => {
    try {
      const destination = new Directory(Paths.cache, 'downloads');
      const safeFileName = `${dayjs().format('YYYYMMDDHHmmss')}_${fileName}`;
      const targetFile = new File(destination, safeFileName);

      if (!destination.exists) {
        destination.create();
      }

      const result = await File.downloadFileAsync(downloadUrl, targetFile, {
        headers: {
          'X-CSRF-TOKEN': global.gToken,
          Cookie: global.gCookie,
        },
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (e) {
      console.log('파일 다운로드 실패', e);
    }
  };

  return (
    <View>
      {isImage ? (
        <Image
          style={{ ...styles.imageView, height, ...imgStyle }}
          source={
            filePath
              ? {
                  uri: downloadUrl,
                  headers: {
                    'X-CSRF-TOKEN': global.gToken,
                    Cookie: global.gCookie,
                    // withCredentials: true,
                  },
                }
              : icon.ico_profile
          }
          contentFit='contain'
        />
      ) : (
        <View
          style={{
            height,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>{fileName}</Text>
          <LVButton title='파일 다운로드' onPress={downloadFile} />
        </View>
      )}

      {/* 이전/다음 버튼 영역 */}
    </View>
  );
};
export default LVImage;

const styles = StyleSheet.create({
  imageView: {
    borderRadius: 4,
    width: '100%',
  },
});
