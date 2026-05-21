import React from 'react';
import { StyleSheet, View } from 'react-native';
// import { HButton, Touchable, HIcon, HMapView, HText } from '@/src/componentss'
// import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import env from '../lib/env';

/* *
 * Import node_modules
 * */
// import ImagePicker from 'react-native-image-picker';

// import { _, Util, Fetch, env, langUtil, bluecolor, Upload } from '@/src/libs';

const envConfig = env();
// const fetchURL = 'http://g1.htns.com';
const fetchURL = envConfig.fetchURL;
// import * as File from '../../src/actions/File'

/**
 * 기본 폼뷰 컴포넌트(사진을 볼수있는 이미지 뷰어)
 * @param {Function} onPressed - 사진이 눌러졌을때 이벤트(FILE_MGT_CODE값 리턴)
 * @param {Function} onSuccess - 사진업로드가 성공했을때 발생 이벤트(res, source값 리턴)
 * @param {Boolean} isAttachable - 버튼 표시 유무(기본값은 false)
 * @param {JSONObject} PhotoData - 사진정보를 넘긴다(COMPANY_CODE, FILE_MGT_CODE, ADD_DATE, ADD_USER_NAME)
 * @param {Styles} style - 뷰어의 컨테이너 스타일 지정
 * @example
 * <PhotoAttach
 style={{ flex: 3.5 }}
 isAttachable
 PhotoData={modelUtil.getModelData('TEMPPHOTO')}
 onSuccess={() => {
   this.fetch('TIR19010002');
 }}
/>
 */

const PhotoAttach = (props) => {
  const { fileInfo } = props;

  return <View style={[styles.container]}></View>;
};

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'white',
  },
  imageThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    height: 100,
  },
  repImage: {
    padding: 3,
    flex: 3.5,
    backgroundColor: 'black',
  },
  tabContainer: {
    margin: 0,
  },
  layoutText: {
    position: 'absolute',
    paddingHorizontal: 15,
    bottom: 70,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  textTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'white',
  },
  textCaption: {
    fontWeight: '400',
    fontSize: 12,
    color: 'white',
  },
  expandImageStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 10,
    right: '0%',
  },
});

export default PhotoAttach;
