import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
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
} from '@/src/components'; // 공통컴포넌트
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action'; // API통신

const APR010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [apprFilter, setApprFilter] = useState([]);
  const [selectedApprType, setSelectedApprType] = useState('ALL');

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

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
    const allFilter = {
      HQCODE: 'ALL',
      HQNAME: '전체',
    };
    setSelectedApprType('ALL');
    const sortedArr = ['VA', 'ND', 'NC'];
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
    };
    const res1 = await Action.getInfoM(payload1);
    setStats(res1);
    const payload2 = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_RQ_TYPE_MULTI: sortedArr,
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      ADMIN_AUTH_CHK: 'N',
    };
    const res2 = await Action.getListM(payload2);
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
            {empInfo?.EMP_NAME_LC}님 결재 현황입니다.
          </Text>
          <LayoutOfStats stats={stats} />
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
                <ContentOfPreview
                  elem={e}
                  key={i}
                  onPress={() => {
                    if (['ND', 'NC'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('OVT010301', e);
                    } else if (['VA', 'NC'].includes(e.RQ_TYPE)) {
                      movingScreen.navigate('LEA010301', e);
                    } else {
                      //@@
                    }
                  }}
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
  const { stats } = props;
  return (
    <View style={[LVStyles.row, { marginTop: 8 }]}>
      <LVCard
        category='stat'
        label={'완료 문서'}
        value={stats?.COMPLETE_APPR_CNT}
        cardStyle={{ backgroundColor: '#F7F8FB', height: 112 }}
        valueStyle={{ color: '#939DAA' }}
      />
      <View style={{ width: 8 }} />
      <LVCard
        category='stat'
        label={'결재할 문서'}
        value={stats?.PENDING_APPR_CNT}
        cardStyle={{ backgroundColor: '#EEF8FF', height: 112 }}
        valueStyle={{ color: '#27A7FF' }}
      />
      <View style={{ width: 8 }} />
      <LVCard
        category='stat'
        label={'진행 문서'}
        value={stats?.PROGRESS_APPR_CNT}
        cardStyle={{ backgroundColor: '#EBEFF5', height: 112 }}
        valueStyle={{ color: '#003282' }}
      />
    </View>
  );
};

const ContentOfPreview = (props: any) => {
  const { elem, onPress } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
      }}
    >
      <View style={LVStyles.row}>
        <View style={{ ...LVStyles.row, justifyContent: 'flex-start' }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16,
            }}
          >
            {elem?.RQ_TYPE_NAME}
          </Text>
          {!!elem?.M_APPR_SUB_TITLE && (
            <View style={{ ...LVStyles.row, justifyContent: 'flex-start' }}>
              <View
                style={{
                  marginLeft: 4,
                  height: 16,
                  width: 2,
                  backgroundColor: '#373747',
                }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {elem?.M_APPR_SUB_TITLE}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            fontWeight: '600',
            color: '#939DAA',
          }}
        >
          {elem?.JOB_NO}
        </Text>
      </View>
      <View style={{ height: 16 }} />
      <View style={{ flex: 1 }}>
        <View style={LVStyles.row}>
          <View style={{ ...LVStyles.row, width: '50%' }}>
            <LVChip
              category='apprStatus'
              title={elem?.AP_STATUS_NAME}
              code={elem?.AP_STATUS}
            />
            <View>
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: 8,
                  fontWeight: '600',
                  color: '#939DAA',
                }}
              >
                {elem?.REASON}
              </Text>
              {elem?.M_APPR_SUB_CONTENTS ? (
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 4,
                    marginLeft: 8,
                    fontWeight: '600',
                    color: '#939DAA',
                  }}
                >
                  {elem?.M_APPR_SUB_CONTENTS}{' '}
                  {elem?.M_CAL_RESULT ? `| ${elem?.M_CAL_RESULT}` : ''}
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View style={LVStyles.row}>
            <LVProfileImage
              imgStyle={styles.profileImg}
              path={elem?.PICTURE_PATH}
            />
            <View style={{ width: 8 }} />
            <Text
              style={{
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              {elem?.RQ_EMP_NAME} {elem?.M_APPR_MEMBER_RANK_NAME}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <Text
        style={{
          color: '#1E2125',
          fontSize: 14,
          fontWeight: '800',
        }}
      >
        {filteredList?.length} 건
      </Text>
    </View>
  );
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
});
