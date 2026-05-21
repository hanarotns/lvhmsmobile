import React from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';

import LVStyles from './LVStyles';

const LVFlag = (props: any) => {
  const {img, title, flagStyle} = props;

  return(
    <View style={[styles.view, flagStyle]} >
      {img && (<Image source={img} style={[LVStyles.iconS, {marginRight: 8,}]}/>)}
      <Text style={styles.text}>{title}</Text>
    </View>
  )
};
export default LVFlag;

const styles = StyleSheet.create({
  view: {
    backgroundColor: '#CCCCDB',
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});