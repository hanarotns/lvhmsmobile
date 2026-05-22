import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from '../component/ImageZoom/index';

import Icon from '@/src/components/Icon';
import { Util } from '../lib';
import env from '../lib/env';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */

const ImageBox = (props) => {
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const [state, setState] = React.useState({
    rotation: 0,
    // componentId: props.route.params.componentId,
    title: props.route.params.title,
    source: props.route.params.source,
    companyCode: props.route.params.companyCode || session.COMPANY_CODE,
    fileMgtCode: props.route.params.fileMgtCode || null,
  });

  //사진 다운로드
  const onDownloadImage = () => {
    // const sourceArr = state.source.split('/');
    // const fileMgtCode = sourceArr[sourceArr.length - 1];
    let sourceURL = state.source;
    // 우선 apicall로 다운받고 있지만 추후 변경 필요 JKM
    if (sourceURL && sourceURL.indexOf('file')) {
      sourceURL = Util.replaceAll(sourceURL, 'file', 'apicall');
    }
    Linking.openURL(
      // 'http://172.168.0.110:8080/api/file/getDownload/HTNS/MB/1561361881090',
      // `${Fetch.fetchURL}/api/file/getDownload/HTNS/MB/1564549320003`, // 1564468326234, 1561361881090, 1564549320003
      // 'https://wins.htns.com//api/file/getDownload/HTNS/TX/1564535402298',
      sourceURL,
    );
    Util.toastMsg('Download 폴더로 저장합니다.');
  };

  // const rotateLeftView = () => {
  //   return (
  //     <TouchableOpacity
  //       style={styles.rotationLeftStyle}
  //       onPress={() => {
  //         setState({
  //           rotation: state.rotation - 90,
  //         });
  //       }}>
  //       <Icon
  //         // name={'rotate-left'}
  //         name={'camera'}
  //         style={{paddingTop: 3}}
  //         size={15}
  //         // color={bluecolor.basicBlueColor}
  //       />
  //     </TouchableOpacity>
  //   );
  // };

  // const rotateRightView = () => {
  //   return (
  //     <TouchableOpacity
  //       style={styles.rotationRightStyle}
  //       onPress={() => {
  //         setState({
  //           rotation: state.rotation + 90,
  //         });
  //       }}>
  //       <Icon
  //         name={'sync'}
  //         // iconType="M"
  //         // name={'rotate-right'}
  //         style={{paddingTop: 3}}
  //         size={15}
  //         // color={bluecolor.basicBlueColor}
  //       />
  //     </TouchableOpacity>
  //   );
  // };

  const downloadView = () => {
    return (
      <TouchableOpacity
        style={styles.downloadStyle}
        onPress={() => {
          onDownloadImage();
        }}
      >
        <Icon name={'download'} style={{ paddingTop: 3 }} size={15} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* https://github.com/ascoders/react-native-image-zoom */}
      <ImageZoom
        cropWidth={screenWidth}
        cropHeight={screenHeight * 0.9}
        imageWidth={screenWidth}
        imageHeight={screenHeight}
        enableSwipeDown
        panToMove
      >
        <Image
          resizeMode={'contain'}
          style={{
            height: '100%',
            width: '100%', // Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: `${state.rotation}deg` }],
          }}
          source={{
            uri: state.source
              ? state.source
              : `${fetchURL}/api/file/getDownload/${state.companyCode}/MB/${state.fileMgtCode}`,
            headers: {
              'X-CSRF-TOKEN': global.gToken,
              Cookie: global.gCookie,
              // withCredentials: true,
            },
          }}
        />
      </ImageZoom>
      {downloadView()}
    </View>
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
  downloadStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    bottom: '3%',
    right: '0%',
  },
});

export default ImageBox;
