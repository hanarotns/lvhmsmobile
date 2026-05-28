import Text from '@/src/components/CustomText';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Util } from '../lib';

const LVCard = (props: any) => {
  const { category } = props;

  if (category === 'stat') {
    const { label, value, cardStyle, valueStyle } = props;
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          height: 100,
          justifyContent: 'center',
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
            marginBottom: 16,
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
  } else if (category === 'preview') {
  } else {
  }
};
export default LVCard;

const styles = StyleSheet.create({});
