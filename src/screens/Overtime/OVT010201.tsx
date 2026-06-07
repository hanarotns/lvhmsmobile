import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  Text,
} from '@/src/components';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
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

  const [otEmpInfo, setOtEmpInfo] = useState({});
  const [accumulatedHours, setAccumulatedHours] = useState({});
  const [approvalLine, setApprovalLine] = useState([]);
  const [fromDateTime, setFromDateTime] = useState<Date>(new Date());
  const [toDateTime, setToDateTime] = useState<Date>(new Date());
  const [overtimeTypeList, setOvertimeTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);

    const payload1 = {
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      EMP_ID: empInfo?.EMP_ID,
      ND_DATE: dayjs(fromDateTime).format('YYYYMMDD'),
    };
    const res1 = await Action.getAccumulatedHours('nd', payload1);
    setAccumulatedHours(res1);
    const payload2 = {
      EMP_ID: empInfo?.EMP_ID,
    };
    const res2 = await Action.getClearInfo(payload2);
    setOtEmpInfo(res2);
    if (res2) {
      let res3 = await COMAction.getCode('code', 'PC0001', {
        GCODE: 'ND_TYPE',
      });
      // @@ OT_LEVEL, 조직/사원의 연장정보까지 고려 필요
      let includedType = [''];
      if (res2?.OT_LEVEL == '0') {
        includedType = [''];
        Alert.alert(
          '알림',
          '연장 불가능한 연장레벨입니다.\n인사팀에 문의하세요',
        );
      } else if (['1', '3'].includes(res2?.OT_LEVEL)) {
        includedType = ['DU'];
      } else if (res2?.OT_LEVEL == '2') {
        includedType = ['OT', 'XX', 'HO']; // @@ 하나로에이 재택, 추가연장 없음 하드코딩
      }
      res3 = res3?.filter((e: object) => {
        return includedType.includes(e?.HQCODE);
      });
      setOvertimeTypeList(res3);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    const body = {
      ND_DATE: dayjs(fromDateTime).format('YYYYMMDD'),
      START_TIME:
        selectedType?.HQCODE === 'OT' ? '' : dayjs(fromDateTime).format('HHmm'),
      CLOSING_DATE: dayjs(toDateTime).format('YYYYMMDD'),
      CLOSING_TIME: dayjs(toDateTime).format('HHmm'),
      ND_TYPE: selectedType?.HQCODE,
      HOLI_GUBUN: selectedType?.HQCODE === 'HO' ? 'Y' : 'N',
      MORN_GUBUN: selectedType?.HQCODE === 'XX' ? 'Y' : 'N',
      HOME_GUBUN: selectedType?.HQCODE === 'HM' ? 'Y' : 'N',
      DUTY_GUBUN: selectedType?.HQCODE === 'DU' ? 'Y' : 'N',
      REASON: overtimeInfo?.REASON,
      DEPT_CODE: otEmpInfo?.DEPT_CODE,
      DEPT_NAME: otEmpInfo?.DEPT_NAME,
      EMP_NAME: otEmpInfo?.EMP_NAME,
      EMP_ID: otEmpInfo?.EMP_ID,
      POSITION_CODE: otEmpInfo?.POSITION_CODE,
      POSITION_NAME: otEmpInfo?.POSITION_NAME,
      OT_LEVEL: otEmpInfo?.OT_LEVEL,
    };
    setLoading(true);
    const result = await Action.saveApproval('nd', body, approvalLine);
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleBothDate = async (value) => {
    setFromDateTime(value);
    setToDateTime(value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
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
              title={'결재선'}
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
                  setDate={handleBothDate}
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
              title={'주누적'}
              children={
                <Text>총 {accumulatedHours?.NC_WEEK_HOUR || '0'} 시간</Text>
              }
            />
            <LVFormOfContents
              title={'월누적'}
              children={
                <Text>총 {accumulatedHours?.NC_MONTH_HOUR || '0'} 시간</Text>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={
                <Input
                  placeholder='시간외 근무 사유를 입력하세요.'
                  value={overtimeInfo?.REASON}
                  onChangeText={(p) => {
                    setOvertimeInfo({
                      ...overtimeInfo,
                      REASON: p,
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
