import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import * as icon from '@/src/assets/images';
import {
  LVButton,
  LVCard,
  LVFilterBottomSheet,
  LVLoadingIndicator,
  LVMovingDateOfArrow,
  LVNoData,
  LVStyles,
  LVTooltip,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import LVTimeline from '@/src/components/LVTimeLine';
import { Util } from '@/src/lib';
import { Ionicons } from '@expo/vector-icons';
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

const LEA030101 = () => {
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
  const [filteredList, setFilteredList] = useState([]);
  const [selectedApprType, setSelectedApprType] = useState('ALL');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onPressFilter = () => {
    if (isFilterOpen) {
      bottomSheetRef.current?.dismiss();
    } else {
      bottomSheetRef.current?.present();
    }
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

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        bottomSheetRef.current?.dismiss();
      };
    }, []),
  );

  useEffect(() => {
    const res = list?.filter((e) => {
      if (selectedApprType === 'ALL') {
        return true;
      } else {
        return selectedApprType.includes(e?.VA_TYPE);
      }
    });
    setFilteredList(res);
  }, [selectedApprType]);

  const commonInfo = {
    S_COMPANY_CODE: empInfo?.COMPANY_CODE,
    S_DEPT_CODE: empInfo?.DEPT_CODE,
    S_EMP_NAME: empInfo?.EMP_NAME_LC,
    S_EMP_ID: empInfo?.EMP_ID,
    S_EMP_FLAG: 'Y',
    S_LINE_STATUS: '',

    SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
    SS_EMP_ID: empInfo?.EMP_ID,
    SS_USER_ROLE: 'U',

    AUTH_GA: 'Y',
    AUTH_AM: 'Y',
  };

  const mount = async () => {
    setLoading(true);

    const payload1 = {
      ...commonInfo,
      YYYYMMDD: selectedDate.format('YYYYMMDD'),
      TO_YEAR: selectedDate.format('YYYY'), // @@
    };
    const res1 = await Action.getInfoMOfSchedule(payload1);
    if (res1) {
      const dateS = dayjs(res1?.APPLY_S_DATE, 'YYYYMMDD').toDate();
      const dateE = dayjs(res1?.APPLY_E_DATE, 'YYYYMMDD').toDate();
      setFromDate(dateS);
      setToDate(dateE);
      const payload2 = {
        ...commonInfo,
        ...res1,
        DATE_GUBUN: 'VA_DATE',
        S_ADD_DATE_FROM: res1?.APPLY_S_DATE,
        S_ADD_DATE_TO: res1?.APPLY_E_DATE,
      };
      const res2 = await Action.getTimelineMOfSchedule(payload2);
      setStats(res1);
      setList(res2);
      setFilteredList(res2);
    } else {
      Alert.alert(
        '기초데이터 미설정',
        '연차부여일이 미설정되었습니다.\n인사팀에 문의하세요.',
        [{ text: '확인' }],
      );
    }
    setLoading(false);
  };

  const handelResearch = async () => {
    setLoading(true);
    const payload = {
      ...commonInfo,
      DATE_GUBUN: 'VA_DATE',
      S_ADD_DATE_FROM: dayjs(fromDate).format('YYYYMMDD'),
      S_ADD_DATE_TO: dayjs(toDate).format('YYYYMMDD'),
    };

    const res = await Action.getListMOfSchedule(payload);
    setList(res);
    setFilteredList(res);
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
        <View style={LVStyles.header}>
          <Text style={LVStyles.headerText}>
            {`${empInfo?.EMP_NAME_LC}님 \n연차사용계획 현황입니다.`}
          </Text>
          <LVMovingDateOfArrow
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            gap='year'
            content={
              `${Util.convertDateTime(stats?.APPLY_S_DATE)} ~ ${Util.convertDateTime(stats?.APPLY_E_DATE)}` ||
              '-'
            }
          />
          <LayoutOfStats
            stats={{
              ...stats,
              PERIOD:
                list?.find((item) => item.TITLE === '연차사용계획 신청')
                  ?.PERIOD ?? 0,
            }}
          />
          <LVButton
            title='연차사용계획 신청하기'
            onPress={() => {
              movingScreen.navigate('LEA020201', stats);
            }}
            rightImg={icon.ico_open}
            buttonStyle={{ marginTop: 24, borderRadius: 28 }}
          />
        </View>
        <View style={styles.timelineSection}>
          {!Util.isEmpty(filteredList) ? (
            <LVTimeline
              data={filteredList}
              onPressItem={(item) => {
                console.log('선택한 항목:', item.TITLE);
                if (item.TITLE === '연차사용계획 신청') {
                  movingScreen.navigate('LEA020301');
                }
              }}
            />
          ) : (
            <LVNoData />
          )}
        </View>
      </ScrollView>
      <View style={LVStyles.filterIconButtonView}>
        <TouchableOpacity
          style={LVStyles.filterIconButton}
          onPress={onPressFilter}
        >
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
        onChange={(index) => setIsFilterOpen(index !== -1)}
      />
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default LEA030101;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ ...LVStyles.row, gap: 8 }}>
        <LVCard
          category='stat'
          label={
            <View>
              <View style={LVStyles.row}>
                <Text>적용 일수</Text>
                {!!stats?.GT_CONT_AL_CNT && (
                  <LVTooltip
                    content={`※ 적용일수=법정연차(${stats?.GT_STAT_AL_CNT}일)+약정연차(${stats?.GT_CONT_AL_CNT}일)`}
                    placement='top'
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={20}
                      color='#777'
                    />
                  </LVTooltip>
                )}
              </View>
              <Text></Text>
            </View>
          }
          value={stats?.GT_NC_QTY}
          cardStyle={{ backgroundColor: '#F7F8FB' }}
          valueStyle={{ color: '#6A727B' }}
        />
        <LVCard
          category='stat'
          label={
            <View>
              <View style={LVStyles.row}>
                <Text>1차촉진</Text>
                {!!stats?.P1_CONT_AL_CNT && (
                  <LVTooltip
                    content={`※ 촉진일수=법정연차(${stats?.P1_STAT_AL_CNT}일)+약정연차(${stats?.P1_CONT_AL_CNT}일)`}
                    placement='top'
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={20}
                      color='#777'
                    />
                  </LVTooltip>
                )}
              </View>
              <Text>(촉진/신청)</Text>
            </View>
          }
          value={
            !!stats?.P1_REM_VC_QTY
              ? `${stats?.P1_REM_VC_QTY || 0}/${stats?.PERIOD || 0}`
              : '-'
            // @@ 신청 당시 값을 저장할지 고민해볼 것
          }
          cardStyle={{ backgroundColor: '#EEF8FF' }}
          valueStyle={{ color: '#27A7FF', fontSize: 20 }}
        />
        <LVCard
          category='stat'
          label={
            <View>
              <View style={LVStyles.row}>
                <Text>2차촉진</Text>
                {!!stats?.P2_CONT_AL_CNT && (
                  <LVTooltip
                    content={`※ 촉진일수=법정연차(${stats?.P2_STAT_AL_CNT}일)+약정연차(${stats?.P2_CONT_AL_CNT}일)`}
                    placement='top'
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={20}
                      color='#777'
                    />
                  </LVTooltip>
                )}
              </View>
              <Text>(촉진/신청)</Text>
            </View>
          }
          value={
            !!stats?.P2_REM_VC_QTY
              ? `${stats?.P2_REM_VC_QTY || 0}/${stats?.PERIOD || 0}`
              : '-'
          }
          cardStyle={{ backgroundColor: '#F4F6F8' }}
          valueStyle={{ color: '#939DAA', fontSize: 16 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineSection: {
    ...LVStyles.body,
    paddingHorizontal: 10,
    paddingTop: 16,
  },
  labelText: {
    fontWeight: '600',
    color: '#939DAA',
  },
  mainText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
