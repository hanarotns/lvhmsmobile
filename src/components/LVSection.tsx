import React from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';

import LVStyles from './LVStyles';

const LVSection = (props: any) => {
  const {img, title} = props;
  
  return (
    <View
    style={{
      flexDirection: 'row',
      paddingBottom: 12,
      borderColor: '#003282',
      borderBottomWidth: 1,
      marginBottom: 10, 
    }}
  >
    <Image
      source={img}
      style={LVStyles.iconS}
    />
    <View style={{width: 4,}}/>
    <Text
      style={{
        color: '#003282',
        fontSize: 16,
        fontWeight: '700',
      }}
    >
      {title}
    </Text>
  </View>
  )
};
export default LVSection;

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