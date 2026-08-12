import Text from '@/src/components/CustomText';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Util } from '../lib';

const LVCard = (props: any) => {
  const { category } = props;

  if (category === 'stat') {
    const { onPress, label, value, cardStyle, valueStyle } = props;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          flex: 1,
          height: 100,
          justifyContent: 'space-around',
          alignItems: 'center',
          borderRadius: 8,
          backgroundColor: '#F7F8FB',
          ...cardStyle,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: '#6A727B',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#6A727B',
            ...valueStyle,
          }}
        >
          {!Util.isEmpty(value) ? String(value) : '0'}
        </Text>
      </TouchableOpacity>
    );
  } else if (category === 'docuPreview') {
    const { onPress, contents } = props;
    return (
      <TouchableOpacity onPress={onPress} style={styles.entire}>
        {contents}
      </TouchableOpacity>
    );
  } else {
  }
};
export default LVCard;

const styles = StyleSheet.create({
  entire: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
});
