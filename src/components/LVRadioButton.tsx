import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as icon from '@/src/assets/images';
import Text from '@/src/components/CustomText';
import LVStyles from './LVStyles';

const LVRadioButton = (props: any) => {
  const { title, gubun, onPress } = props;

  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row' }}>
      <Image
        source={Boolean(gubun) ? icon.ico_check_on : icon.ico_check_off}
        style={LVStyles.iconS}
      />
      <View style={{ width: 8 }} />
      <Text style={Boolean(gubun) ? styles.radioSelected : styles.radio}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
export default LVRadioButton;

const styles = StyleSheet.create({
  radio: {
    marginRight: 16,
    fontSize: 16,
    color: '#888', // Light gray
  },
  radioSelected: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#6078F8', // Bright blue for selection
  },
});
