import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
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
  LVModal,
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
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Action from './Action';

const LEA010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [apprFilter, setApprFilter] = useState([]);
  const [selectedApprType, setSelectedApprType] = useState('ALL');

  const [isVisibleModal, setIsVisibleModal] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openFilter = () => {
    console.log('ref:', bottomSheetRef.current);
    bottomSheetRef.current?.present();
  };

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused, selectedDate]);

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
    setApprFilter([allFilter, ...restFilter]);

    const payload1 = {
      ...commonInfo,
      DATE_GUBUN: 'VA_DATE',
      S_ADD_DATE_FROM: selectedDate.format('YYYYMMDD'),
      S_ADD_DATE_TO: selectedDate.format('YYYYMMDD'),
      TO_YEAR: selectedDate.format('YYYY'), // @@
    };
    const res1 = await Action.getInfoM(payload1);
    if (res1) {
      const payload2 = {
        ...commonInfo,
        DATE_GUBUN: 'VA_DATE',
        S_ADD_DATE_FROM: res1?.APPLY_S_DATE,
        S_ADD_DATE_TO: res1?.APPLY_E_DATE,
      };
      const res2 = await Action.getListM(payload2);
      setStats(res1);
      setList(res2);
      setFilteredList(res2);
    } else {
      setIsVisibleModal(true);
    }
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
            {empInfo?.EMP_NAME_LC}님 휴가 현황입니다.
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
          <LayoutOfStats stats={stats} />
          <LVButton
            title='휴가 신청하기'
            onPress={() => {
              movingScreen.navigate('LEA010201', stats);
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
                  onPress={() => {
                    movingScreen.navigate('LEA010301', e);
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
      {/* <View style={styles.floatingButton}>
        <TouchableOpacity style={styles.filterIconButton} onPress={openFilter}>
          <SlidersHorizontal size={24} color='#FFF' />
        </TouchableOpacity>
      </View> */}
      <LVFilterBottomSheet ref={bottomSheetRef} />
      {isVisibleModal && (
        <LVModal
          title={'기초데이터 미설정'}
          contents={<ContentsOfAlert />}
          onVisible={setIsVisibleModal}
          onOk={() => {
            setIsVisibleModal(false);
          }}
          buttonText={'확인'}
        />
      )}
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default LEA010101;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={LVStyles.row}>
        <LVCard
          category='stat'
          label={'적용 일수'}
          value={stats?.VC_QTY}
          cardStyle={{ backgroundColor: '#F7F8FB' }}
          valueStyle={{ color: '#6A727B' }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'사용 일수'}
          value={stats?.VC_QTY - stats?.REM_VC_QTY || 0}
          cardStyle={{ backgroundColor: '#EFFBFB' }}
          valueStyle={{ color: '#39CCCC' }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'잔여 일수'}
          value={stats?.REM_VC_QTY - stats?.VALID_VA_QTY || 0}
          cardStyle={{ backgroundColor: '#EEF8FF' }}
          valueStyle={{ color: '#27A7FF' }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'신청 일수'}
          value={stats?.VALID_VA_QTY}
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
        <Text style={styles.labelText}>{elem?.VA_TYPE_NAME}</Text>
        <Text style={styles.labelText}>{elem?.JOB_NO}</Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={LVStyles.row}>
        <View
          style={{ ...LVStyles.row, justifyContent: 'flex-start', flex: 1 }}
        >
          <LVChip
            category='apprStatus'
            title={elem?.AP_STATUS_NAME}
            code={elem?.AP_STATUS}
          />
          <View style={{ width: 8 }} />
          <Text numberOfLines={1} style={styles.mainText}>
            <Text numberOfLines={1} style={styles.mainText}>
              {Util.convertDateTime(elem?.VAC_START)} (
              {dayjs(elem?.VAC_START).format('ddd')})
            </Text>
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

const ContentsOfAlert = (props: any) => {
  return (
    <View style={styles.alertView}>
      <Text style={styles.alertText}>
        {`연차부여일이 미설정되었습니다.\n인사팀에 문의하세요`}
      </Text>
    </View>
  );
};

const allFilter = {
  HQCODE: 'ALL',
  HQNAME: '전체',
};

let restFilter = [
  {
    HQCODE: ['VY', 'VM', 'VA', 'VH', 'VE'],
    HQNAME: '연차',
  },
  {
    HQCODE: ['OD', 'OM', 'OA', 'VO', 'VOM', 'VOD'], // @@ 대체휴가는 공가가 아님
    HQNAME: '공가',
  },
];

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
});
