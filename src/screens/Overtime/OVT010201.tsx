import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
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
import { Util } from '@/src/lib';
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
  const setLeaveRefresh = useRefreshStore((state) => state.setLeaveRefresh);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [otEmpInfo, setOtEmpInfo] = useState({});
  const [regularEmpInfo, setRegularEmpInfo] = useState({});
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

    const res3 = await Action.getUserWSEInfo(payload1);
    setRegularEmpInfo(res3);

    setLoading(false);
  };

  /**
   * 비즈니스 로직 확인용
   */
  const checkLogic = async () => {
    if (Util.isEmpty(approvalLine)) {
      Util.toastMsg('결재선을 선택하세요', 'info');
      return false;
    }
    if (Util.isEmpty(selectedType)) {
      Util.toastMsg('종류를 선택하세요', 'info');
      return false;
    }
    if (!fromDateTime) {
      Util.toastMsg('시작일시를 입력하세요', 'info');
      return false;
    }
    if (!toDateTime) {
      Util.toastMsg('종료일시를 입력하세요', 'info');
      return false;
    }
    if (Util.isEmpty(overtimeInfo?.REASON)) {
      Util.toastMsg('내용을 입력하세요', 'info');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }

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
    setLeaveRefresh(true);
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
    if (Util.isEmpty(selectedType)) {
      Util.toastMsg('종류를 먼저 선택하세요', 'info');
      return false;
    }
    setFromDateTime(value);
    setToDateTime(value);
  };

  const handleSelected = async (p) => {
    setSelectedType(p);
    // 연장 구분에 따른 시작 종료 일시 초기값 설정하기
    if (regularEmpInfo?.NORMAL_ON_TIME && regularEmpInfo?.NORMAL_OFF_TIME) {
      const onTime = dayjs(
        regularEmpInfo?.NORMAL_ON_TIME,
        'YYYYMMDDHHmm',
      ).toDate();
      const offTime = dayjs(
        regularEmpInfo?.NORMAL_OFF_TIME,
        'YYYYMMDDHHmm',
      ).toDate();
      if (p?.HQCODE === 'XX') {
        const onTimeBefore30min = new Date(onTime.getTime() - 30 * 60 * 1000);
        setFromDateTime(onTimeBefore30min);
        setToDateTime(onTime);
      } else {
        setFromDateTime(onTime);
        setToDateTime(offTime);
      }
    }
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
                    <TouchableOpacity onPress={() => handleSelected(e)}>
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
                  textStyle={styles.multilineInput}
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
            buttonStyle={LVStyles.whiteBgButton}
            textStyle={LVStyles.whiteBgButtonText}
          />
          {/* 최초 상신 */}
          <LVButton
            title={'상신'}
            onPress={handleSubmit}
            buttonStyle={LVStyles.defaultButton}
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
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D5DCE5',
  },
  typeListView: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multilineInput: {
    color: '#373747',
    minHeight: 100,
    textAlignVertical: 'top', // Android에서 상단 정렬
  },
});
