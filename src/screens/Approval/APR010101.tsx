import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVCard,
  LVChip,
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
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';
dayjs.locale('ko');

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

  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [cardFilter, setCardFilter] = useState([]);
  const [selectedCards, setSelectedCards] = useState<string[]>(['pending']);
  const [apprFilter, setApprFilter] = useState([]);
  const [selectedApprType, setSelectedApprType] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));

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

  useEffect(() => {
    // @@ 화면 진입 시, 동작 안하도록
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
  }, [selectedApprType]);

  const mount = async () => {
    setLoading(true);
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
    getList();
    setStats(res1);
    setLoading(false);
  };

  const getList = async () => {
    let commonInfo = {
      S_AP_STATUS_MULTI: ['S'],
      S_LINE_STATUS: 'C',
    };
    if (selectedCards.includes('complete')) {
      commonInfo = {
        S_AP_STATUS_MULTI: ['A', 'R'],
        S_LINE_STATUS: '',
      };
    }
    if (selectedCards.includes('pending')) {
      commonInfo = {
        S_AP_STATUS_MULTI: ['S'],
        S_LINE_STATUS: 'C',
      };
    }
    if (selectedCards.includes('progress')) {
      commonInfo = {
        S_AP_STATUS_MULTI: ['S'],
        S_LINE_STATUS: '',
      };
    }

    const payload2 = {
      ...commonInfo,
      S_RQ_TYPE_MULTI: sortedArr,
      S_ADD_DATE_FROM: selectedDate.add(-3, 'month').format('YYYYMMDD'),
      S_ADD_DATE_TO: selectedDate.format('YYYYMMDD'),
      // @@ 스크롤에 따른 문서 개수 조정
      PAGE_NO_FROM: 1,
      PAGE_NO_TO: 100,
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      ADMIN_AUTH_CHK: 'N',
    };
    setLoading(true);
    const res2 = await Action.getListM(payload2);
    setList(res2);
    setFilteredList(res2);
    setSelectedApprType('ALL');
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
            {empInfo?.EMP_NAME_LC}님 결재 현황입니다.
          </Text>
          <LayoutOfStats
            stats={stats}
            toggleCard={toggleCard}
            selectedCards={selectedCards}
          />
          <Filter
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
                    if (['ND', 'NC'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('OVT010301', e);
                    } else if (['VA', 'NC'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('LEA010301', e);
                    } else {
                      //@@
                    }
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
        <Text style={styles.mainText}>
          {Util.convertDateTime(elem?.RQ_DATE)} (
          {dayjs(elem?.RQ_DATE).format('ddd')}) | {elem?.RQ_TYPE_NAME}
        </Text>
        <Text style={styles.docuPreviewText}>{elem?.JOB_NO}</Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={{ flex: 1 }}>
        <View style={LVStyles.row}>
          <View style={{ ...LVStyles.row, justifyContent: 'flex-start' }}>
            <LVChip
              category='apprStatus'
              title={elem?.AP_STATUS_NAME}
              code={elem?.AP_STATUS}
            />
            <View style={{ width: 8 }} />
            <View>
              <Text numberOfLines={1} style={styles.labelText}>
                {elem?.REASON}
              </Text>
            </View>
          </View>
          <View style={LVStyles.row}>
            <LVProfileImage
              imgStyle={styles.profileImg}
              path={elem?.PICTURE_PATH}
            />
            <View style={{ width: 8 }} />
            <Text style={styles.mainText}>{elem?.RQ_EMP_NAME}</Text>
          </View>
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

const allFilter = {
  HQCODE: 'ALL',
  HQNAME: '전체',
};

const sortedArr = ['VA', 'ND', 'NC'];

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
});
