import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import * as icon from '@/src/assets/images';
import {
  LVButton,
  LVCard,
  LVChip,
  LVFilterBottomSheet,
  LVLoadingIndicator,
  LVMovingDateOfArrow,
  LVNoData,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { SlidersHorizontal } from 'lucide-react-native';
import * as Action from './Action';

const OVT010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const { leaveRefresh, setLeaveRefresh } = useRefreshStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openFilter = () => {
    console.log('ref:', bottomSheetRef.current);
    bottomSheetRef.current?.present();
  };

  useEffect(() => {
    mount();
  }, [selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (leaveRefresh) {
        mount();
        setLeaveRefresh(false);
      }
    }, [leaveRefresh]),
  );

  const mount = async () => {
    setLoading(true);

    const dateS = selectedDate.startOf('month').toDate();
    const dateE = selectedDate.endOf('month').toDate();
    setFromDate(dateS);
    setToDate(dateE);

    const payload1 = {
      YEAR_MONTH: selectedDate.format('YYYYMM'),
    };
    const payload2 = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      // S_DEPT_CODE: '',
      // S_EMP_NAME: '',
      // S_EMP_ID: '',
      S_EMP_FLAG: 'Y',
      DATE_GUBUN: 'OT_DATE',
      S_ADD_DATE_FROM: dayjs(dateS).format('YYYYMMDD'),
      S_ADD_DATE_TO: dayjs(dateE).format('YYYYMMDD'),
      S_LINE_STATUS: '',
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_USER_ROLE: 'U',
      // AUTH_PORGA: 'Y',
      // AUTH_PORAM: 'Y',
    };

    const res1 = await Action.getInfoM(payload1);
    setStats(res1);
    const res2 = await Action.getListM(payload2);
    setList(res2);
    setLoading(false);
  };

  const handelResearch = async () => {
    setLoading(true);
    const payload = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      // S_DEPT_CODE: '',
      // S_EMP_NAME: '',
      // S_EMP_ID: '',
      S_EMP_FLAG: 'Y',
      DATE_GUBUN: 'OT_DATE',
      S_ADD_DATE_FROM: dayjs(fromDate).format('YYYYMMDD'),
      S_ADD_DATE_TO: dayjs(toDate).format('YYYYMMDD'),
      S_LINE_STATUS: '',
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_USER_ROLE: 'U',
      // AUTH_PORGA: 'Y',
      // AUTH_PORAM: 'Y',
    };

    const res = await Action.getListM(payload);
    setList(res);
    setLoading(false);
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {empInfo?.EMP_NAME_LC}님 시간외 현황입니다.
          </Text>
          <LVMovingDateOfArrow
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            gap='month'
            content={
              `${selectedDate.format('YYYY')}년 ${selectedDate.format(
                'MM',
              )}월` || '-'
            }
          />
          <LayoutOfStats stats={stats} />
          <LVButton
            title='시간외 예정 신청하기'
            onPress={() => {
              movingScreen.navigate('OVT010201');
            }}
            rightImg={icon.ico_open}
            buttonStyle={{ marginTop: 24, borderRadius: 28 }}
          />
        </View>
        <View style={styles.body}>
          {!Util.isEmpty(list) ? (
            <View>
              {list?.map((e, i) => (
                <LVCard
                  category='docuPreview'
                  onPress={() => {
                    movingScreen.navigate('OVT010301', e);
                  }}
                  contents={
                    <DocuPreviewContent
                      elem={e}
                      key={i}
                      onConfReq={() => {
                        if (e?.AP_STATUS === 'A') {
                          movingScreen.navigate('OVT010202', e);
                        } else {
                          Util.toastMsg(
                            '예정 결재가 완료되어야 신청가능합니다.',
                            'info',
                          );
                        }
                      }}
                    />
                  }
                />
              ))}
            </View>
          ) : (
            <LVNoData />
          )}
        </View>
      </ScrollView>
      <View style={styles.floatingButton}>
        <TouchableOpacity style={styles.filterIconButton} onPress={openFilter}>
          <SlidersHorizontal size={24} color='#FFF' />
        </TouchableOpacity>
      </View>
      <LVFilterBottomSheet
        ref={bottomSheetRef}
        onSearch={handelResearch}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default OVT010101;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16, gap: 8 }}>
      <View style={styles.card}>
        <Text style={styles.cardText}>{`총 연장 `}</Text>
        <Text style={styles.cardValueText}>
          {!Util.isEmpty(stats?.TOTAL_HOURS)
            ? Math.floor(stats?.TOTAL_HOURS)
            : `0`}
        </Text>
        <Text style={styles.cardText}>시간</Text>
      </View>
    </View>
  );
};

const DocuPreviewContent = (props: any) => {
  const { elem, onConfReq } = props;
  return (
    <>
      <View style={{ flex: 1 }}>
        <View style={LVStyles.row}>
          <Text style={styles.labelText}>{elem?.ND_TYPE_NM}</Text>
          <Text style={styles.labelText}>
            {elem?.JOB_NO}{' '}
            {elem?.CONFIRM_JOB_NO ? '/ ' + elem?.CONFIRM_JOB_NO : ''}
          </Text>
        </View>
        <View style={{ height: 8 }} />
        <View style={{ ...LVStyles.row, justifyContent: 'flex-start' }}>
          {/* @@ 예/확정 APPR_STATUS 따로 받는 방식으로 수정 */}
          <LVChip
            category='apprStatus'
            title={`예정 ${elem?.AP_STATUS_NAME}`}
            code={elem?.AP_STATUS}
          />
          <Text
            style={{
              marginLeft: 8,
              fontWeight: '600',
              color: elem?.CONFIRM_JOB_NO ? '#ABBACD' : '#373747',
            }}
          >
            {Util.convertDateTime(
              elem?.ND_DATE,
              elem?.ND_TYPE !== 'OT' ? elem?.START_TIME : elem?.NORMAL_OFF_TIME,
              //@@ ND_TYPE = 'OT' 인 경우 연장시작시간 가져오는 로직으로 수정 필요!!!
            )}
            {'~'}
            {Util.convertDateTime('', elem?.CLOSING_TIME)}
          </Text>
        </View>
        <View style={{ height: 8 }} />
        {elem?.CONFIRM_JOB_NO ? (
          <View style={{ ...LVStyles.row, justifyContent: 'flex-start' }}>
            <LVChip
              category='apprStatus'
              title={`확정 ${elem?.CONFIRM_P_STATUS_NAME}`}
              code={elem?.CONFIRM_P_STATUS}
            />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: '600',
                color: elem?.CONFIRM_JOB_NO ? '#373747' : '#ABBACD',
              }}
            >
              {Util.convertDateTime(
                elem?.CONFIRM_NDS_DATE,
                elem?.ND_TYPE === 'OT'
                  ? elem?.NORMAL_OFF_TIME
                  : elem?.CONFIRM_NDS_TIME,
              )}
              {'~'}
              {Util.convertDateTime('', elem?.CONFIRM_NDE_TIME)}
            </Text>
            {/* @@ 시간 정확하게 계산하지 않으므로 생략 */}
            {/* <Text
              style={{
                marginLeft: 8,
                fontWeight: '600',
                color: '#FF9E3C',
              }}>
              {elem?.NC_HOUR}
            </Text> */}
          </View>
        ) : (
          <LVButton
            title='확정신청'
            onPress={onConfReq}
            buttonStyle={styles.confReqButton}
            textStyle={styles.confReqButtonText}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 32,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  headerText: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 24,
  },
  body: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  labelText: {
    fontWeight: '600',
    color: '#939DAA',
  },
  mainText: { fontWeight: '700', fontSize: 14 },
  confReqButton: {
    borderColor: '#ABBACD',
    borderWidth: 1,
    padding: 9,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confReqButtonText: {
    color: '#27A7FF',
    fontSize: 14,
  },
  filterIconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#27A7FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    top: 24,
    right: 32,
  },
  card: {
    backgroundColor: '#FFF7EF',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cardText: {
    color: '#FF9E3C',
    marginBottom: 4,
    fontSize: 24,
  },
  cardValueText: {
    color: '#FF9E3C',
    marginBottom: 4,
    fontSize: 24,
    fontWeight: '700',
  },
});
