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
                  <LVChip category='apprLineFlag' title='일반' />
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
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
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
  selectedDisp: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    height: '100%',
    padding: 8,
  },
  chipView: {
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalView: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D5DCE5',
  },
  iconWrap: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#27A7FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoListView: {
    height: 48,
    justifyContent: 'center',
  },
  leavedayCalculation: {
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBoxWrap: {
    flex: 1,
    width: '70%',
    justifyContent: 'center',
  },
  modalInsideView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
