import * as icon from '@/src/assets/images';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const LVConfirmIndicator = (props: any) => (
  <View style={[styles.indicator, props.styleIndicator]}>
    <LottieView
      style={{ width: 160, height: 160 }}
      source={icon.ani_confirm}
      autoPlay
      loop={false}
    />
  </View>
);

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#454D585F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LVConfirmIndicator;
