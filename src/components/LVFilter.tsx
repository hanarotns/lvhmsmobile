import Text from '@/src/components/CustomText';
import LVChip from '@/src/components/LVChip';
import LVStyles from '@/src/components/LVStyles';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const LVFilter = (props: any) => {
  const { apprFilter, selectedApprType, setSelectedApprType, filteredList } =
    props;
  return (
    <View style={[LVStyles.row, { marginTop: 16 }]}>
      <View style={{ flexDirection: 'row' }}>
        {apprFilter.map((e) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedApprType(e.HQCODE);
            }}
          >
            <LVChip
              category='type'
              content={e.HQNAME}
              chipStyle={{
                paddingVertical: 6,
                borderColor:
                  selectedApprType === e?.HQCODE ? '#27A7FF' : '#6A727B',
              }}
              textStyle={{
                color: selectedApprType === e?.HQCODE ? '#27A7FF' : '#6A727B',
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text
        style={{
          color: '#1E2125',
          fontSize: 14,
          fontWeight: '800',
        }}
      >
        {filteredList?.length} 건
      </Text>
    </View>
  );
};
export default LVFilter;

const styles = StyleSheet.create({});
