import * as icon from '@/src/assets/images';
import {
  Icon,
  LVButton,
  LVChip,
  LVLoadingIndicator,
  LVNoData,
  RefreshControl,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import LVStyles from '@/src/components/LVStyles';
import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Util } from '@/src/lib';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import * as Action from './Action'; // API통신

const OVT010101 = () => {
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

  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused, selectedDate]);

  const mount = async () => {
    setLoading(true);
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
      S_ADD_DATE_FROM: selectedDate.format('YYYYMM') + '01',
      S_ADD_DATE_TO: selectedDate.format('YYYYMM') + '31',
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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 현황판 Section */}
        <View
          style={{ padding: 32, paddingBottom: 24, backgroundColor: '#FFF' }}
        >
          <Text
            style={{
              fontWeight: '700',
              fontSize: 24,
              marginBottom: 24,
            }}
          >
            {empInfo?.EMP_NAME_LC}님 시간외 현황입니다.
          </Text>
          <MovingDateOfArrow
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            gap='month'
            content={
              `${selectedDate.format('YYYY')}년 ${selectedDate.format(
                'MM',
              )}월` || '-'
            }
          />
          <Board stats={stats} />
          <LVButton
            title='시간외 예정 신청하기'
            onPress={() => {
              movingScreen.navigate('OVT010201');
            }}
            rightImg={icon.ico_open}
            buttonStyle={{ marginTop: 24, borderRadius: 28 }}
          />
        </View>
        {/* 문서내역 Section */}
        <View style={styles.docuListSection}>
          {!Util.isEmpty(list) ? (
            <View>
              {list?.map((e, i) => (
                <ContentOfPreview
                  elem={e}
                  key={i}
                  onPress={() => {
                    movingScreen.navigate('OVT010301', e);
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
    </View>
  );
};
export default OVT010101;

const Board = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={LVStyles.row}>
        <CardOfStats
          title={'연장'}
          time={stats?.OT_HOURS}
          textColor='#FF9E3C'
          bgColor='#FFF7EF'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'추가연장'}
          time={stats?.BO_HOURS}
          textColor='#FF9E99'
          bgColor='#FFF7FF'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'조출'}
          time={stats?.XX_HOURS}
          textColor='#BCAF7F'
          bgColor='#FAF9F5'
        />
      </View>
      <View style={[LVStyles.row, { marginTop: 8 }]}>
        <CardOfStats
          title={'휴일'}
          time={stats?.HO_HOURS}
          textColor='#00B25F'
          bgColor='#EBF9F2'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'재택'}
          time={stats?.HM_HOURS}
          textColor='#924529'
          bgColor='#F6F0EE'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'당직'}
          time={stats?.DU_HOURS}
          textColor='#008066'
          bgColor='#EBF5F3'
        />
      </View>
    </View>
  );
};

const CardOfStats = (props: any) => {
  const { title, sum, time, textColor, bgColor } = props;
  return (
    <View
      style={{
        flex: 1,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius: 8,
      }}
    >
      <Text
        style={{
          color: '#6A727B',
          fontSize: 14,
          fontWeight: '500',
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
      >
        <Text style={{ color: textColor, fontSize: 24, fontWeight: '800' }}>
          {time != undefined ? String(time) + `h` : '-'}
        </Text>
      </View>
    </View>
  );
};

const ContentOfPreview = (props: any) => {
  const { elem, onPress, code } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        LVStyles.row,
        {
          backgroundColor: '#FFF',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F1F1',
        },
      ]}
    >
      {/* 콘텐츠 */}
      <View
        style={{
          flex: 1,
          // marginLeft: 24,
        }}
      >
        <View style={[LVStyles.row, { marginBottom: 8 }]}>
          <Text
            style={{
              fontWeight: '600',
              color: '#939DAA',
            }}
          >
            {elem?.ND_TYPE_NM}
          </Text>
          <Text
            style={{
              fontWeight: '600',
              color: '#939DAA',
            }}
          >
            {elem?.JOB_NO}{' '}
            {elem?.CONFIRM_JOB_NO ? '/ ' + elem?.CONFIRM_JOB_NO : ''}
          </Text>
        </View>
        <View
          style={[
            LVStyles.row,
            { justifyContent: 'flex-start', marginBottom: 8 },
          ]}
        >
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
        {elem?.CONFIRM_JOB_NO ? (
          <View style={[LVStyles.row, { justifyContent: 'flex-start' }]}>
            <LVChip
              category='apprStatus'
              title={`확정 ${elem?.CONFIRM_P_STATUS_NAME}`}
              code={elem?.CONFIRM_P_STATUS}
            />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: '700',
                color: '#373747',
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
          <TouchableOpacity
            onPress={() => {
              if (elem?.M_APPR_STATUS === '02') {
                movingScreen.navigate('OVT010202', elem);
              } else {
                Util.toastMsg('예정 결재가 완료되어야 신청가능합니다.', 'info');
              }
            }}
            style={{
              borderColor: '#ABBACD',
              borderWidth: 1,
              padding: 9,
              borderRadius: 8,
              backgroundColor: '#FFF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: '#27A7FF',
                fontWeight: '700',
              }}
            >
              확정신청
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const MovingDateOfArrow = (props: any) => {
  const { selectedDate, setSelectedDate, gap, content } = props;
  return (
    <View style={[LVStyles.row, { justifyContent: 'center' }]}>
      <Icon
        name={'chevron-left-outline'}
        fill={'#939DAA'}
        onPress={() => {
          const temp = selectedDate.add(-1, gap);
          setSelectedDate(temp);
        }}
      />
      <Text
        style={{
          fontWeight: '800',
          fontSize: 14,
          color: '#1E2125',
          marginHorizontal: 4,
        }}
      >
        {content}
      </Text>
      <Icon
        name={'chevron-right-outline'}
        fill={'#939DAA'}
        onPress={() => {
          const temp = selectedDate.add(+1, gap);
          setSelectedDate(temp);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  docuListSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
});
