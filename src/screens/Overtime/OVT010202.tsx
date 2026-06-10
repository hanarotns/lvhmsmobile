import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVApprLineForm,
  LVButton,
  LVCheckBox,
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as Action from './Action';
dayjs.extend(customParseFormat);

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const OVT010202 = () => {
  const movingScreen = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
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

  const [approvalLine, setApprovalLine] = useState([]);
  const [fromDateTime, setFromDateTime] = useState<Date>(new Date());
  const [toDateTime, setToDateTime] = useState<Date>(new Date());
  const [isChange, setIsChange] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보
  const [dt, setDt] = useState({});
  const [accumulatedHours, setAccumulatedHours] = useState({});
  const [otHours, setOtHours] = useState({});

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    const detail = await Action.getDetailM('nc', route?.params);
    const hours1 = await Action.getAccumulatedHours('nc', detail);
    setAccumulatedHours(hours1);
    const hours2 = await Action.calTime(detail);
    setOtHours(hours2);

    let apprLine = await Action.getApproval33(detail);
    apprLine = apprLine.map((e) => ({
      ...e,
      LINE_ID: e?.LINE_NO,
      APPROVAL_EMP_ID: e?.AP_EMP_ID,
      APPROVAL_EMP_NAME: e?.AP_EMP_NAME,
      APPROVAL_EMP_DEPT_CODE: e?.AP_DEPT_CODE,
      APPROVAL_EMP_DEPT_NAME: e?.AP_DEPT_NAME,
    }));
    const sortedApprLine = [...apprLine].sort((a, b) => a.LINE_ID - b.LINE_ID);

    const res = {
      ...route?.params,
      ...detail,
      APPR_LINE: sortedApprLine,
    };

    setFromDateTime(
      dayjs(res?.ND_DATE + res?.START_TIME, 'YYYYMMDDHHmm').toDate(),
    );
    setToDateTime(
      dayjs(res?.CLOSING_DATE + res?.CLOSING_TIME, 'YYYYMMDDHHmm').toDate(),
    );

    setDt(res);
    setApprovalLine(res?.APPR_LINE);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...dt,
      APPLY_WEEK_HOUR: String(
        accumulatedHours?.NC_WEEK_HOUR + otHours?.OVER_TIME,
      ),
      APPLY_MONTH_HOUR: String(
        accumulatedHours?.NC_MONTH_HOUR + otHours?.OVER_TIME,
      ),
      APPLY_HOUR_W: String(otHours?.OVER_TIME),
    };
    setLoading(true);
    const result = await Action.saveApproval('nc', payload, approvalLine);
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
              title={'예정번호'}
              children={
                <View style={[LVStyles.row, { flex: 1 }]}>
                  <Text style={{ fontWeight: '500' }}>{dt?.JOB_NO}</Text>
                  <LVChip
                    category='apprStatus'
                    title={dt?.AP_STATUS_NAME}
                    code={dt?.AP_STATUS}
                  />
                </View>
              }
            />
            <LVFormOfContents
              title={'예정시간'}
              children={
                <Text style={styles.dateTimeText}>
                  {Util.convertDateTime(
                    dt?.ND_DATE,
                    dt?.ND_TYPE !== 'OT' ? dt?.START_TIME : dt?.NORMAL_OFF_TIME,
                    //@@ ND_TYPE = 'OT' 인 경우 연장시작시간 가져오는 로직으로 수정 필요!!!
                  )}
                  {'~'}
                  {Util.convertDateTime(dt?.CLOSING_DATE, dt?.CLOSING_TIME)}
                </Text>
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <LVChip
                  category='type'
                  content={dt?.ND_TYPE_NM}
                  chipStyle={styles.typeChip}
                  textStyle={{ color: '#FF9E3C' }}
                />
              }
            />
            <LVFormOfContents
              title={'주누적'}
              children={
                <Text style={{ fontWeight: '700' }}>
                  {dt?.NC_WEEK_HOUR
                    ? `총 ${dt?.NC_WEEK_HOUR || 0} 시간`
                    : `총 ${accumulatedHours?.NC_WEEK_HOUR || 0} 시간`}
                </Text>
              }
            />
            <LVFormOfContents
              title={'월누적'}
              children={
                <Text style={{ fontWeight: '700' }}>
                  {dt?.NC_MONTH_HOUR
                    ? `총 ${dt?.NC_MONTH_HOUR || 0} 시간`
                    : `총 ${accumulatedHours?.NC_MONTH_HOUR || 0} 시간`}
                </Text>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={<Text style={{ fontWeight: '700' }}>{dt?.REASON}</Text>}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <LVCheckBox
                label='시간변경'
                value={isChange}
                onChange={setIsChange}
              />
            </View>
            <LVFormOfContents
              title={'시작일시'}
              children={
                isChange ? (
                  <LVDateTimePicker
                    date={fromDateTime}
                    setDate={setFromDateTime}
                  />
                ) : (
                  <Text style={styles.dateTimeText}>
                    {Util.convertDateTime(dt?.ND_DATE, dt?.START_TIME) || '-'}
                  </Text>
                )
              }
            />
            <LVFormOfContents
              title={'종료일시'}
              children={
                isChange ? (
                  <LVDateTimePicker date={toDateTime} setDate={setToDateTime} />
                ) : (
                  <Text style={styles.dateTimeText}>
                    {Util.convertDateTime(dt?.CLOSING_DATE, dt?.CLOSING_TIME) ||
                      '-'}
                  </Text>
                )
              }
            />
            <LVFormOfContents
              title={'신청시간'}
              children={
                <Text style={{ fontWeight: '700' }}>
                  {dt?.NC_HOUR
                    ? `${dt?.NC_HOUR || 0} 시간`
                    : `${otHours?.OVER_TIME || 0} 시간`}
                </Text>
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
export default OVT010202;

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
  dateTimeText: {
    fontWeight: '700',
    color: '#ABBACD',
  },
  typeView: {
    borderColor: '#FF9E3C',
    backgroundColor: '#FFF7EF',
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
    paddingHorizontal: 12,
    // @@ 크기 유동적으로 수정할 것.
    width: 100,
    alignItems: 'center',
  },
  typeText: {
    color: '#FF9E3C',
    fontSize: 14,
    fontWeight: '700',
  },
  typeChip: {
    borderColor: '#FF9E3C',
    backgroundColor: '#FFF7EF',
    maxWidth: 100,
  },
});
