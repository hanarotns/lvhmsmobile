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
  LVChip,
  LVColors,
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

const LEA020101 = () => {
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
      DATE_GUBUN: 'VA_DATE',
      S_ADD_DATE_FROM: selectedDate.format('YYYYMMDD'),
      S_ADD_DATE_TO: selectedDate.format('YYYYMMDD'),
      TO_YEAR: selectedDate.format('YYYY'), // @@
    };
    const res1 = await Action.getInfoM(payload1);
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
      const res2 = await Action.getListMOfSchedule(payload2);
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
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {empInfo?.EMP_NAME_LC}님 연차예정 현황입니다.
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
              PERIOD: list?.[0]?.PERIOD,
            }}
          />
          <LVButton
            title='연차사용예정 신청하기'
            onPress={() => {
              movingScreen.navigate('LEA020201', stats);
            }}
            rightImg={icon.ico_open}
            buttonStyle={{ marginTop: 24, borderRadius: 28 }}
          />
        </View>
        <View style={styles.body}>
          {!Util.isEmpty(filteredList) ? (
            <View>
              {filteredList?.map((e, i) => (
                <LVCard
                  category='docuPreview'
                  onPress={() => {
                    movingScreen.navigate('LEA020301', e);
                  }}
                  contents={<DocuPreviewContent elem={e} key={i} />}
                />
              ))}
            </View>
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
export default LEA020101;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ ...LVStyles.row, gap: 8 }}>
        <LVCard
          category='stat'
          label={'적용 일수'}
          value={stats?.VC_QTY}
          cardStyle={{ backgroundColor: '#F7F8FB' }}
          valueStyle={{ color: '#6A727B' }}
        />
        <LVCard
          category='stat'
          label={'사용 일수'}
          value={stats?.VC_QTY - stats?.REM_VC_QTY || 0}
          cardStyle={{ backgroundColor: '#EFFBFB' }}
          valueStyle={{ color: '#39CCCC' }}
        />
        <LVCard
          category='stat'
          label={'잔여 일수'}
          value={stats?.REM_VC_QTY || 0}
          cardStyle={{ backgroundColor: '#EEF8FF' }}
          valueStyle={{ color: '#27A7FF' }}
        />
        <LVCard
          category='stat'
          label={'신청 일수'}
          value={stats?.PERIOD || 0}
          cardStyle={{ backgroundColor: '#F4F6F8' }}
          valueStyle={{ color: '#939DAA' }}
        />
      </View>
    </View>
  );
};

const DocuPreviewContent = (props: any) => {
  const { elem } = props;
  return (
    <>
      <View style={LVStyles.row}>
        <LVChip
          category='apprStatus'
          title={elem?.AP_STATUS_NAME}
          code={elem?.AP_STATUS}
        />
        <Text style={styles.labelText}>{elem?.JOB_NO}</Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={LVStyles.row}>
        <View
          style={{ ...LVStyles.row, justifyContent: 'flex-start', flex: 1 }}
        >
          <View style={{ width: 8 }} />
          <Text numberOfLines={1} style={styles.mainText}>
            {Util.convertDateTime(elem?.VA_START)} (
            {dayjs(elem?.VA_START).format('ddd')}) {'연차예정 '}
          </Text>
          <View style={{ ...LVStyles.row, gap: 8 }}>
            <Text style={styles.labelText}></Text>
          </View>
          <Text numberOfLines={1} style={styles.mainText}>
            {elem?.CNT > 1 ? `외 ${elem?.CNT - 1} 건` : ``}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            ...styles.mainText,
            // @@ 연차미차감 건들만 하드코딩
            color: ['OD', 'OM', 'OA', 'VO', 'VOM', 'VOD'].includes(
              elem?.VA_TYPE,
            )
              ? LVColors.secondary
              : LVColors.primary,
          }}
        >
          {elem?.PERIOD} 일
        </Text>
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
  mainText: {
    fontWeight: '700',
    fontSize: 14,
  },
  alertView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  alertText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#373747',
  },
  changeText: {
    color: '#FF676A',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#FF676A',
    paddingHorizontal: 8,
  },
});
