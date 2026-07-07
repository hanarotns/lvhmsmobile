import Text from '@/src/components/CustomText';
import LVChip from '@/src/components/LVChip';
import LVStyles from '@/src/components/LVStyles';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const LVFilter = (props: any) => {
  const { apprFilter, selectedApprType, setSelectedApprType, filteredList } =
    props;
  return (
    <View style={[LVStyles.row, { marginTop: 16, gap: 16 }]}>
      <ScrollView
        nestedScrollEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 8,
        }}
        style={{ flex: 1 }}
      >
        {apprFilter.map((e) => (
          <TouchableOpacity onPress={() => setSelectedApprType(e.HQCODE)}>
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
      </ScrollView>
      <Text style={styles.text}>{filteredList?.length} 건</Text>
    </View>
  );
};
export default LVFilter;

const styles = StyleSheet.create({
  text: {
    color: '#1E2125',
    fontSize: 14,
    fontWeight: '800',
  },
});
