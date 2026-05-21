import { BackIcon } from '@/src/components/Icons';
import LVLoadingIndicator from '@/src/components/LVLoadingIndicator';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { TopNavigation } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as File from './File';
import PhotoAttach from './PhotoAttach';

/**
 * 배송완료 사진 등록
 */
const PhotoList = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { fileInfo } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const profile = props.route.params.profile;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const fetchImage = async () => {
    File.getFileList(fileInfo).then((result) => {
      console.log('fetch', result);
      if (result) {
        setData(result.data);
      }
    });
    setLoading(false);
  };
  useEffect(() => {
    setLoading(true);
    if (isFocused) {
      fetchImage();
    }
  }, [isFocused]);
  return loading ? (
    <LVLoadingIndicator />
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <TopNavigation
        accessoryLeft={() => <BackIcon navigation={navigation} />}
        alignment='center'
        title={'이미지'}
      />

      <PhotoAttach
        style={{ flex: 3.5 }}
        isAttachable
        photoList={data}
        fileInfo={fileInfo}
        onCallback={fetchImage}
        profile={profile}
      />
    </SafeAreaView>
  );
};
export default PhotoList;
