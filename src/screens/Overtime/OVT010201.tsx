import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVApprLineForm,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVDateTimePicker,
  LVFormOfContents,
  LVLoadingIndicator,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from '@/src/components';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';

const OVT010201 = () => {
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [approvalLine, setApprovalLine] = useState([]);
  const approvalLineRef = useRef<any>(null);
  const [fromDateTime, setFromDateTime] = useState<Date>(new Date());
  const [toDateTime, setToDateTime] = useState<Date>(new Date());
  const [overtimeTypeList, setOvertimeTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보
  const [myApprList, setMyApprList] = useState([]);
  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    // 시간외 종류 가져오기
    let res = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'ND_TYPE',
    });
    setOvertimeTypeList(res);
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    const approvalInfo = {
      APPR_TITLE: '시간외근무신청',
      APPR_TYPE: '02',
      APPR_STATUS: '01',
    };
    const body = {
      F1: approvalInfo,
      G1: approvalLine,
      F2: {
        ...overtimeInfo,
        OT_TYPE: selectedType?.HQCODE, // 시간외 종류
        // 예정 시작 일시
        OT_DATE: fromDateTime.toISOString().substring(0, 10).replace(/-/g, ''),
        ES_START_TIME:
          ('0' + fromDateTime.getHours()).slice(-2) +
          ('0' + fromDateTime.getMinutes()).slice(-2),
        // 확정 시작 일시
        ES_END_DATE: toDateTime
          .toISOString()
          .substring(0, 10)
          .replace(/-/g, ''),
        ES_END_TIME:
          ('0' + toDateTime.getHours()).slice(-2) +
          ('0' + toDateTime.getMinutes()).slice(-2),
      },
    };
    const result = await Action.save(body);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.container}>
            <LVFormOfContents
              title={'신청정보'}
              children={
                <LVApprLineForm
                  approvalLine={approvalLine}
                  setApprovalLine={setApprovalLine}
                />
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <View style={styles.typeListView}>
                  {overtimeTypeList?.map((e: any) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedType(e);
                      }}
                    >
                      <LVChip
                        category='type'
                        content={e.HQNAME}
                        chipStyle={{
                          borderColor:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#FF9E3C'
                              : '#6A727B',
                        }}
                        textStyle={{
                          color:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#FF9E3C'
                              : '#6A727B',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />
            <LVFormOfContents
              title={'시작일시'}
              children={
                <LVDateTimePicker
                  date={fromDateTime}
                  setDate={setFromDateTime}
                />
              }
            />
            <LVFormOfContents
              title={'종료일시'}
              children={
                <LVDateTimePicker date={toDateTime} setDate={setToDateTime} />
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={
                <Input
                  value={overtimeInfo?.MEMO}
                  onChangeText={(p) => {
                    setOvertimeInfo({
                      ...overtimeInfo,
                      MEMO: p,
                    });
                  }}
                  size='large'
                  style={{ backgroundColor: '#FFF' }}
                  textStyle={{ color: '#373747', minHeight: 100 }}
                  multiline={true}
                />
              }
            />
          </View>
        </ScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'취소'}
            onPress={movingScreen.goBack}
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <View style={{ width: 8 }} />
          {/* 최초 상신 */}
          <LVButton
            title={'상신'}
            onPress={handleSubmit}
            buttonStyle={{ flex: 1 }}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default OVT010201;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D5DCE5',
  },
  cancelButtonText: {
    color: '#373747',
  },
  myApprListView: {
    display: 'flex',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DCE5',
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
  typeListView: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
