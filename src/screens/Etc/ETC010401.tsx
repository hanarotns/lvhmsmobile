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
  LVColors,
  LVFilter,
  LVFilterBottomSheet,
  LVLoadingIndicator,
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
dayjs.locale('ko');

const ETC010401 = () => {
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
  const [apprFilter, setApprFilter] = useState([]);
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
        return selectedApprType.includes(e?.PE_TYPE);
      }
    });
    setFilteredList(res);
  }, [selectedApprType]);

  const mount = async () => {
    setLoading(true);
    setApprFilter([allFilter, ...restFilter]);

    const dateS = selectedDate.subtract(1, 'year').toDate();
    const dateE = selectedDate.toDate();
    setFromDate(dateS);
    setToDate(dateE);

    const payload2 = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_DEPT_CODE: empInfo?.DEPT_CODE,
      S_EMP_NAME: empInfo?.EMP_NAME_LC,
      S_EMP_ID: empInfo?.EMP_ID,
      S_EMP_FLAG: 'Y',
      S_FROM_DATE: dayjs(dateS).format('YYYYMMDD'),
      S_TO_DATE: dayjs(dateE).format('YYYYMMDD'),
      S_PE_TYPE: '',
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      // SS_USER_ROLE: 'U',
      // AUTH_GA: 'Y',
      // AUTH_AM: 'Y',
    };
    const res1 = await Action.getInfoMOfCert(payload2);
    setStats(res1);
    const res2 = await Action.getListMOfCert(payload2);
    setList(res2);
    setFilteredList(res2);
    setLoading(false);
  };

  const handelResearch = async () => {
    setLoading(true);
    const payload2 = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_DEPT_CODE: empInfo?.DEPT_CODE,
      S_EMP_NAME: empInfo?.EMP_NAME_LC,
      S_EMP_ID: empInfo?.EMP_ID,
      S_EMP_FLAG: 'Y',
      S_FROM_DATE: dayjs(fromDate).format('YYYYMMDD'),
      S_TO_DATE: dayjs(toDate).format('YYYYMMDD'),
      S_PE_TYPE: '',
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      // SS_USER_ROLE: 'U',
      // AUTH_GA: 'Y',
      // AUTH_AM: 'Y',
    };
    const res1 = await Action.getInfoMOfCert(payload2);
    setStats(res1);
    const res2 = await Action.getListMOfCert(payload2);
    setList(res2);
    setFilteredList(res2);
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
            {empInfo?.EMP_NAME_LC}님 증명서 현황입니다.
          </Text>
          <LayoutOfStats stats={stats} />
          <LVButton
            title='증명서 신청하기'
            onPress={() => {
              movingScreen.navigate('ETC010402', stats);
            }}
            rightImg={icon.ico_open}
            buttonStyle={{ marginTop: 24, borderRadius: 28 }}
          />
          <LVFilter
            apprFilter={apprFilter}
            selectedApprType={selectedApprType}
            setSelectedApprType={setSelectedApprType}
            filteredList={filteredList}
          />
        </View>
        <View style={styles.body}>
          {!Util.isEmpty(filteredList) ? (
            <View>
              {filteredList?.map((e, i) => (
                <LVCard
                  category='docuPreview'
                  onPress={() => movingScreen.navigate('ETC010403', e)}
                  contents={<DocuPreviewContent elem={e} key={i} />}
                />
              ))}
              <View style={{ height: 100 }} />
            </View>
          ) : (
            <LVNoData />
          )}
        </View>
      </ScrollView>
      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={styles.filterIconButton}
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
export default ETC010401;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ ...LVStyles.row, gap: 8 }}>
        <LVCard
          category='stat'
          label={'전체 건수'}
          value={stats?.TOTAL_CNT || 0}
          cardStyle={{ backgroundColor: '#F3F7FB' }}
          valueStyle={{ color: '#6A727B' }}
        />
        <LVCard
          category='stat'
          label={'신청 건수'}
          value={stats?.REQ_CNT || 0}
          cardStyle={{ backgroundColor: '#FFF8ED' }}
          valueStyle={{ color: '#F59E0B' }}
        />
        <LVCard
          category='stat'
          label={'완료 건수'}
          value={stats?.CONFIRM_CNT || 0}
          cardStyle={{ backgroundColor: '#F1FCF4' }}
          valueStyle={{ color: '#22A55A' }}
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
          title={elem?.SUBMIT_STATUS_NAME}
          code={elem?.SUBMIT_STATUS}
        />
        <Text style={styles.labelText}>{elem?.ISSUE_NO}</Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={LVStyles.row}>
        <View
          style={{ ...LVStyles.row, justifyContent: 'flex-start', flex: 1 }}
        >
          <View style={{ width: 8 }} />
          <Text numberOfLines={1} style={styles.mainText}>
            {Util.convertDateTime(elem?.REQ_DATE)} (
            {dayjs(elem?.REQ_DATE).format('ddd')}) {elem?.PE_TYPE_NAME}{' '}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            ...styles.mainText,
            color:
              elem?.PRINT_COUNT < 1 ? LVColors.primary : LVColors.secondary,
          }}
        >
          {elem?.PRINT_STATUS_NAME}
        </Text>
      </View>
    </>
  );
};

const allFilter = {
  HQCODE: 'ALL',
  HQNAME: '전체',
};

const restFilter = [
  {
    HQCODE: 'AC', // @@ 임의로 정함.
    HQNAME: '급여명세서',
  },
  {
    HQCODE: 'PE',
    HQNAME: '재직증명서',
  },
  {
    HQCODE: 'WR',
    HQNAME: '원천(작년)',
  },
  {
    HQCODE: 'WC',
    HQNAME: '원천(올해)',
  },
];

const styles = StyleSheet.create({
  header: {
    padding: 32,
    paddingBottom: 10,
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
  floatingButton2: {
    position: 'absolute',
    bottom: 32,
    right: 32,
  },
  changeText: {
    color: '#FF676A',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#FF676A',
    paddingHorizontal: 8,
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
});
