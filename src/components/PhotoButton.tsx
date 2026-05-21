/**
 * 사진 첨부 기능
 */
import Icon from '@/src/components/Icon';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconBadge from 'react-native-icon-badge';
import { Util } from '../lib';

import env from '@/src/lib/env';

const envConfig = env();
const fetchURL = envConfig.fetchURL;

const PhotoButton = (props) => {
  const navigation = useNavigation();
  const { disabled, files, fileInfo, getFileCount, icon, title } = props;
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);
  useEffect(() => {
    if (isFocused) {
      if (fileInfo.current.REF_NO) {
        setData(files);
        return;
      }
      Util.onReadFiles().then((result) => {
        const parray = [];
        result
          .filter((file) => {
            // if (data.filter((f) => f.src == file.path).length > 0) {
            //     return false
            // }
            if (file.path.indexOf('REF_NOTSETTING') > -1) {
              return true;
            }
            return false;
          })
          .map((rec, index) => {
            console.log(rec.path);
            parray.push({
              id: index + data.length + 1,
              src: rec.path,
              localFile: true,
            });
          });
        setData([...parray]);
        getFileCount(parray.length);
      });
    }
  }, [isFocused, fileInfo.current, files]);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#DEE6EE',
        width: 95,
        height: 88,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={() =>
        navigation.push('PhotoList', {
          fileInfo: fileInfo.current,
        })
      }
    >
      {/* {data.slice(0, 4).map((item, index) => renderIem({ item, index, navigation }))} */}
      {/* {arrayFromArg(empCnt).map((i, index) => <View key={index} style={{ flex: 0.25 }} />)} */}
      <IconBadge
        MainElement={
          icon ? (
            <Image
              source={icon}
              resizeMode={'contain'}
              style={{
                width: 35,
                height: 35,
              }}
            />
          ) : (
            <Icon
              name={'camera-outline'}
              disabled={disabled}
              fill={'black'}
              style={{
                width: 35,
                height: 35,
              }}
            />
          )
        }
        BadgeElement={
          <TouchableOpacity>
            <Text style={{ color: '#FFFFFF' }}>{data.length}</Text>
          </TouchableOpacity>
        }
        IconBadgeStyle={{
          width: 20,
          height: 20,
          top: -10,
          right: -10,
          backgroundColor: 'gray',
        }}
        Hidden={data.length == 0}
      />
      <View style={{ height: 8 }} />
      <Text
        style={{
          color: '#454D58',
          fontWeight: '600',
          fontSize: 16,
        }}
      >
        {title ? title : '사진 등록'}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  imageThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    height: 70,
  },
});

export default PhotoButton;
