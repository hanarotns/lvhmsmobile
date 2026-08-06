import { Dimensions, StyleSheet, Text, View } from 'react-native';

import * as icon from '@/src/assets/images';
import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import React, { useEffect } from 'react';

import env from '@/src/lib/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import Icon from './Icon';
import LVButton from './LVButton';
import LVStyles from './LVStyles';

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

      if (!destination.exists) {
        destination.create({ idempotent: true });
      }

      const safeFileName = `${dayjs().format('YYYYMMDDHHmmss')}_${fileName}`;
      const targetFile = new File(destination, safeFileName);

      const result = await File.downloadFileAsync(downloadUrl, targetFile, {
        headers: {
          'X-CSRF-TOKEN': global.gToken,
          Cookie: global.gCookie,
        },
      });

      const downloadedFile = new File(result.uri);

      if (!downloadedFile.exists) {
        console.log(
          '파일이 아직 존재하지 않습니다. 미리보기 창을 껐다가 다시 시도해주세요.',
        );
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedFile.uri);
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
        <View style={{ ...styles.docuView, height }}>
          <View style={styles.docuContentsView}>
            <Icon name='file-document-outline' color='lightgray' size={192} />
            <Text style={styles.fileText}>{fileName}</Text>
            <View style={{ height: 16 }} />
            <Text style={styles.guideText}>
              ※ 이 문서는 다운로드하여 확인할 수 있습니다.
            </Text>
          </View>
          <View style={styles.buttonView}>
            <LVButton
              title='다운로드하여 확인'
              onPress={downloadFile}
              buttonStyle={LVStyles.defaultButton}
            />
          </View>
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
  docuView: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  docuContentsView: {
    alignItems: 'center',
  },
  fileText: {
    fontSize: 20,
  },
  guideText: {
    fontSize: 16,
    color: '#FF676A',
  },
  buttonView: {
    flexDirection: 'row',
    padding: 16,
    width: '100%',
    bottom: 0,
    gap: 8,
  },
});
