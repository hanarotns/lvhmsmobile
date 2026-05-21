import Text from '@/src/components/CustomText';
import LVStyles from '@/src/components/LVStyles';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const LVFormOfContents = (props: any) => {
  const { title, children } = props;
  return (
    <View style={[LVStyles.row]}>
      <View
        style={{
          width: '20%',
          height: 48,
          justifyContent: 'center',
          alignSelf: 'flex-start',
        }}
      >
        <Text
          style={{
            color: '#6A727B',
            fontWeight: '600',
          }}
        >
          {title}
        </Text>
      </View>
      <View
        style={{
          width: '80%',
          minHeight: 48,
          justifyContent: 'center',
          paddingHorizontal: 8,
        }}
      >
        {children}
      </View>
    </View>
  );
};
export default LVFormOfContents;

const styles = StyleSheet.create({});
