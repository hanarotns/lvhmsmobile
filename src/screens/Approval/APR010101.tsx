import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVCard,
  LVChip,
  LVFilter,
  LVFilterBottomSheet,
  LVLoadingIndicator,
  LVNoData,
  LVProfileImage,
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
import * as COMAction from '../Common/Action';
import * as Action from './Action';
dayjs.locale('ko');

const PAGE_SIZE = 100;

const APR010101 = () => {
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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedCards, setSelectedCards] = useState<string[]>(['pending']);
  const [apprFilter, setApprFilter] = useState([]);
  const [selectedApprType, setSelectedApprType] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isFirstRender = useRef(true);

  const openFilter = () => {
    console.log('ref:', bottomSheetRef.current);
    bottomSheetRef.current?.present();
  };

  const toggleCard = (key: string) => {
    setSelectedCards([key]);
    // @@ 임시로
    // setSelectedCards((prev) =>
    //   prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    // );
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    getList();
  }, [selectedCards]);

  useEffect(() => {
    const res = list?.filter((e) => {
      if (selectedApprType === 'ALL') {
        return true;
      } else {
        return e.RQ_TYPE === selectedApprType;
      }
    });
    setFilteredList(res);
  }, [selectedApprType, list]);

  const mount = async () => {
    setLoading(true);

    const dateS = selectedDate.add(-3, 'month').toDate();
    const dateE = selectedDate.toDate();
    setFromDate(dateS);
    setToDate(dateE);

    // 결재 타입 조회
    let resOfApprType = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'RQ_TYPE',
    });
    setSelectedApprType('ALL');
    resOfApprType = resOfApprType.filter((e) => {
      return sortedArr.includes(e?.HQCODE); // @@ 연차, 연장 관련만 하드코딩
    });

    const sorted = resOfApprType.sort(
      (a, b) => sortedArr.indexOf(a.HQCODE) - sortedArr.indexOf(b.HQCODE),
    );
    setApprFilter([allFilter, ...resOfApprType]);

    // 통계리스트 조회
    const payload1 = {
      S_RQ_TYPE_MULTI: sortedArr,
      S_ADD_DATE_FROM: selectedDate.add(-3, 'month').format('YYYYMMDD'),
      S_ADD_DATE_TO: selectedDate.format('YYYYMMDD'),
    };
    const res1 = await Action.getInfoM(payload1);

    await getList(dateS, dateE, 1);
    setStats(res1);
    setLoading(false);
  };

  const handelResearch = async () => {
    setLoading(true);
    await getList(fromDate, toDate, 1);
    setLoading(false);
  };

  const getList = async (fDate?: Date, tDate?: Date, nextPage = 1) => {
    if (loadingMore) return;

    const isMore = nextPage > 1;

    if (isMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
      setHasMore(true);
    }

    let commonInfo = {
      APPR_STATUS_CHECK: 'PENDING',
    };
    if (selectedCards.includes('complete')) {
      commonInfo = {
        APPR_STATUS_CHECK: 'COMPLETE',
      };
    }
    if (selectedCards.includes('pending')) {
      commonInfo = {
        APPR_STATUS_CHECK: 'PENDING',
      };
    }
    if (selectedCards.includes('progress')) {
      commonInfo = {
        APPR_STATUS_CHECK: 'PROGRESS',
      };
    }

    const payload2 = {
      ...commonInfo,
      S_RQ_TYPE_MULTI: sortedArr,
      S_ADD_DATE_FROM: fDate
        ? dayjs(fDate).format('YYYYMMDD')
        : selectedDate.add(-3, 'month').format('YYYYMMDD'),
      S_ADD_DATE_TO: tDate
        ? dayjs(tDate).format('YYYYMMDD')
        : selectedDate.format('YYYYMMDD'),
      PAGE_NO_FROM: (nextPage - 1) * PAGE_SIZE + 1,
      PAGE_NO_TO: nextPage * PAGE_SIZE,
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      ADMIN_AUTH_CHK: 'N',
    };

    const res2 = await Action.getListM(payload2);

    if (isMore) {
      setList((prev) => [...prev, ...res2]);
      setFilteredList((prev) => [...prev, ...res2]);
    } else {
      setList(res2);
      setFilteredList(res2);
      setSelectedApprType('ALL');
    }

    setPage(nextPage);
    setHasMore(res2?.length === PAGE_SIZE);

    setLoading(false);
    setLoadingMore(false);
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

          const isBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 30;

          if (isBottom && hasMore && !loading && !loadingMore) {
            getList(fromDate, toDate, page + 1);
          }
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {empInfo?.EMP_NAME_LC}님 결재 현황입니다.
          </Text>
          <LayoutOfStats
            stats={stats}
            toggleCard={toggleCard}
            selectedCards={selectedCards}
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
                  key={`${e?.JOB_NO}_${i}`}
                  category='docuPreview'
                  onPress={() => {
                    if (['ND', 'NC'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('OVT010301', e);
                    } else if (['VA'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('LEA010301', e);
                    } else if (['VS'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('LEA020301', e);
                    }
                  }}
                  contents={<DocuPreviewContent elem={e} key={i} />}
                />
              ))}
              {loadingMore && (
                <View style={styles.loadingMoreView}>
                  <Text style={styles.loadingMoreText}>불러오는 중...</Text>
                </View>
              )}
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
export default APR010101;

const LayoutOfStats = (props: any) => {
  const { stats, toggleCard, selectedCards } = props;
  return (
    <View style={{ ...LVStyles.row, gap: 8 }}>
      <LVCard
        category='stat'
        label={'완료 문서'}
        onPress={() => toggleCard('complete')}
        value={stats?.COMPLETE_APPR_CNT}
        cardStyle={{
          backgroundColor: '#F7F8FB',
          height: 112,
          borderColor: '#939DAA',
          borderWidth: selectedCards.includes('complete') ? 2 : 0,
        }}
        valueStyle={{ color: '#939DAA' }}
      />
      <LVCard
        category='stat'
        label={'결재할 문서'}
        onPress={() => toggleCard('pending')}
        value={stats?.PENDING_APPR_CNT}
        cardStyle={{
          backgroundColor: '#EEF8FF',
          height: 112,
          borderColor: '#27A7FF',
          borderWidth: selectedCards.includes('pending') ? 2 : 0,
        }}
        valueStyle={{ color: '#27A7FF' }}
      />
      <LVCard
        category='stat'
        label={'진행 문서'}
        onPress={() => toggleCard('progress')}
        value={stats?.PROGRESS_APPR_CNT}
        cardStyle={{
          backgroundColor: '#EBEFF5',
          height: 112,
          borderColor: '#003282',
          borderWidth: selectedCards.includes('progress') ? 2 : 0,
        }}
        valueStyle={{ color: '#003282' }}
      />
    </View>
  );
};

const DocuPreviewContent = (props: any) => {
  const { elem, onPress } = props;
  return (
    <>
      <View style={LVStyles.row}>
        <View style={LVStyles.row}>
          <LVChip
            category='apprStatus'
            title={elem?.AP_STATUS_NAME}
            code={elem?.AP_STATUS}
            style={{ flex: 1 }}
          />
          <View style={{ width: 8 }} />
          <Text style={styles.mainText}>{`${elem?.RQ_TYPE_NAME}`}</Text>
        </View>
        <Text style={styles.docuPreviewText}>{elem?.JOB_NO}</Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={{ ...LVStyles.row, flex: 1 }}>
        <View
          style={{
            ...LVStyles.row,
            flex: 0.7,
            gap: 8,
          }}
        >
          <Text style={styles.mainText}>
            {elem?.EXEC_DATE
              ? `${Util.convertDateTime(elem?.EXEC_DATE)} (${dayjs(elem?.EXEC_DATE).format('ddd')})`
              : `${Util.convertDateTime(elem?.RQ_DATE)} (${dayjs(elem?.RQ_DATE).format('ddd')})`}
          </Text>
          <Text style={styles.flagText}>
            {elem?.VA_TYPE &&
              (['OD', 'OM', 'OA', 'VO', 'VOM', 'VOD'].includes(elem?.VA_TYPE)
                ? '공가'
                : '연차')}
          </Text>
          <Text numberOfLines={1} ellipsizeMode='tail' style={styles.labelText}>
            {elem?.REASON}
          </Text>
        </View>
        <View style={{ ...LVStyles.row, flex: 0.3, gap: 8 }}>
          <LVProfileImage
            imgStyle={styles.profileImg}
            path={elem?.PICTURE_PATH}
          />
          <Text style={styles.mainText}>{elem?.RQ_EMP_NAME}</Text>
        </View>
      </View>
    </>
  );
};

const Filter = (props: any) => {
  const { apprFilter, selectedApprType, setSelectedApprType, filteredList } =
    props;
  return (
    <View style={[LVStyles.row, { marginTop: 16 }]}>
      <View style={{ flexDirection: 'row' }}>
        {apprFilter.map((e) => (
          <TouchableOpacity
            key={e?.HQCODE}
            onPress={() => {
              setSelectedApprType(e.HQCODE);
            }}
          >
            <LVChip
              category='type'
              content={e.HQNAME}
              chipStyle={{
                paddingVertical: 6,
                borderColor:
                  selectedApprType === e?.HQCODE ? '#27A7FF' : '#6A727B',
              }}
              textStyle={{
                color: selectedApprType === e?.HQCODE ? '#27A7FF' : '#6A727B',
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.filterText}>{filteredList?.length} 건</Text>
    </View>
  );
};

const sortedArr = ['VA', 'ND', 'NC', 'VS'];

const allFilter = {
  HQCODE: 'ALL',
  HQNAME: '전체',
};

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
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  labelText: {
    fontWeight: '600',
    color: '#939DAA',
    flex: 1,
  },
  mainText: {
    fontWeight: '700',
    fontSize: 16,
  },
  docuPreviewText: {
    fontWeight: '600',
    color: '#939DAA',
  },
  filterText: {
    color: '#1E2125',
    fontSize: 14,
    fontWeight: '800',
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
  flagText: {
    fontWeight: '600',
  },
  loadingMoreView: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#939DAA',
    fontWeight: '600',
  },
});
