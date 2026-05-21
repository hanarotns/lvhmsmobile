import * as icon from '@/src/assets/images';
import { Text } from '@/src/components'; // 공통컴포넌트
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const LVNoData = (props: any) => {
  const { data, mainColor, style, reqApproval } = props;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
      }}
    >
      <Image source={icon.ico_nodata} />
      <Text
        style={{
          marginTop: 24,
          fontWeight: '600',
          fontSize: 16,
          color: '#6A727B',
        }}
      >
        데이터가 없습니다.
      </Text>
    </View>
  );
};
export default LVNoData;

const styles = StyleSheet.create({});
