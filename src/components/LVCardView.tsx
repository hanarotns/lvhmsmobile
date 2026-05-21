import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import LVFlag from '@/src/components/LVFlag';

const LVCardView = (props: any) => {
  const { img, title, onPress, buttonStyle } = props;

  return (
    <TouchableOpacity
      style={{ marginBottom: 8 }}
      onPress={() => {
        navigation.push('OVT010102_2', { item });
      }}
    >
      <View style={item.AP_STATUS !== 'A' ? styles.card : styles.card_c}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={styles.cardDate}>
            {Util.convertDateTime(item.ADD_DATE) || '-'}
          </Text>
          <View style={{ width: 23 }} />
          <LVFlag
            title={selectedNdType(item.ND_TYPE).text}
            flagStyle={{
              backgroundColor:
                item.AP_STATUS !== 'A'
                  ? selectedNdType(item.ND_TYPE).color
                  : '#CCCCDB',
            }}
          />
          <View style={{ width: 4 }} />
          <LVFlag
            title={selectedApStatus(item.AP_STATUS).text}
            flagStyle={{
              backgroundColor: selectedApStatus(item.AP_STATUS).color,
            }}
          />
        </View>
        <View style={{ height: 16 }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <LVTwoLine label={item.DEPT_NAME} content={item.EMP_NAME} />
          <LVTwoLine
            label={'예정시작일시'}
            content={Util.convertDateTime(item.ND_DATE, item.START_TIME)}
          />
          <LVTwoLine
            label={'예정종료일시'}
            content={Util.convertDateTime(item.CLOSING_DATE, item.CLOSING_TIME)}
          />
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          width: 4,
          height: '100%',
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
          backgroundColor: item.AP_STATUS !== 'A' ? '#6078F8' : '#D5D5E5',
        }}
      />
    </TouchableOpacity>
  );
};
export default LVCardView;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6078F8',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
