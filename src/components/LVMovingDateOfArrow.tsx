import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/src/components/CustomText';
import Icon from '@/src/components/Icon';
import LVStyles from '@/src/components/LVStyles';

const LVMovingDateOfArrow = (props: any) => {
  const { selectedDate, setSelectedDate, gap, content } = props;
  return (
    <View style={[LVStyles.row, { justifyContent: 'center' }]}>
      <Icon
        name='chevron-left'
        color='#939DAA'
        onPress={() => {
          const temp = selectedDate.add(-1, gap);
          setSelectedDate(temp);
        }}
      />
      <Text
        style={{
          fontWeight: '800',
          fontSize: 14,
          color: '#1E2125',
          marginHorizontal: 4,
        }}
      >
        {content}
      </Text>
      <Icon
        name='chevron-right'
        color='#939DAA'
        onPress={() => {
          const temp = selectedDate.add(+1, gap);
          setSelectedDate(temp);
        }}
      />
    </View>
  );
};
export default LVMovingDateOfArrow;

const styles = StyleSheet.create({});
