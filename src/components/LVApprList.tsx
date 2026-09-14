import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LVApprLine, LVChip, Text } from '@/src/components';
import 'dayjs/locale/ko';

const LVApprList = forwardRef((props: any, ref) => {
  const { myApprList, approvalInfo } = props;

  const [selectedAppr, setSelectedAppr] = useState(approvalInfo);
  useImperativeHandle(ref, () => ({
    getSelectedValues: () => ({
      selectedAppr,
    }),
  }));

  return (
    <View>
      {myApprList?.map((e, i) => {
        const isSelected = selectedAppr?.H_TP_SEQ === e?.H_TP_SEQ;

        return (
          <TouchableOpacity
            key={e?.H_TP_SEQ || i}
            style={{
              flexDirection: 'row',
              padding: 16,
              borderBottomWidth: isSelected ? 2 : 1,
              borderBottomColor: isSelected ? '#27A7FF' : '#D5DCE5',
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? '#27A7FF' : '#6A727B',
              backgroundColor: isSelected ? '#EEF8FF' : '#F0F2F6',
            }}
            onPress={() => {
              setSelectedAppr(e);
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.myApprListTitleView}>
                <View style={styles.apprLineView}>
                  <LVChip category='apprLineFlag' title={e?.ADD_TYPE_NAME} />
                  <Text style={styles.apprLineNameText}>{e?.AP_NAME}</Text>
                </View>
                <Text style={styles.myApprListTitle}>{e?.APPR_LINE_NAME}</Text>
              </View>
              <View style={{ height: 8 }} />
              <LVApprLine
                data={e?.DETAILS}
                mainColor={'#6A727B'}
                reqApproval={true}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default LVApprList;

const styles = StyleSheet.create({
  apprLineView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  apprLineNameText: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  myApprListTitleView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  myApprListTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#373747',
  },
});
