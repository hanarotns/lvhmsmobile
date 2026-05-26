import * as icon from '@/src/assets/images';
import {
  Icon,
  LVButton,
  LVChip,
  LVLoadingIndicator,
  LVModal,
  LVNoData,
  RefreshControl,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import LVStyles from '@/src/components/LVStyles';
import { Util } from '@/src/lib';
import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Action from './Action'; // API통신

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
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);

  const [isVisibleModal, setIsVisibleModal] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused, selectedDate]);

  const mount = async () => {
    setLoading(true);
    const payload1 = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_DEPT_CODE: empInfo?.DEPT_CODE,
      S_EMP_NAME: empInfo?.EMP_NAME_LC,
      S_EMP_ID: empInfo?.EMP_ID,
      S_EMP_FLAG: 'Y',
      DATE_GUBUN: 'VA_DATE',
      S_ADD_DATE_FROM: selectedDate.format('YYYYMMDD'),
      S_ADD_DATE_TO: selectedDate.format('YYYYMMDD'),
      S_LINE_STATUS: '',
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_USER_ROLE: 'U',
      AUTH_GA: 'Y',
      AUTH_AM: 'Y',
      TO_YEAR: '2026', // @@
    };
    const res1 = await Action.getInfoM(payload1);
    if (res1) {
      const payload2 = {
        S_COMPANY_CODE: empInfo?.COMPANY_CODE,
        S_DEPT_CODE: empInfo?.DEPT_CODE,
        S_EMP_NAME: empInfo?.EMP_NAME_LC,
        S_EMP_ID: empInfo?.EMP_ID,
        S_EMP_FLAG: 'Y',
        DATE_GUBUN: 'VA_DATE',
        S_ADD_DATE_FROM: res1?.APPLY_S_DATE,
        S_ADD_DATE_TO: res1?.APPLY_E_DATE,
        S_LINE_STATUS: '',
        SS_USER_ROLE: 'U',
        AUTH_GA: 'Y',
        AUTH_AM: 'Y',
      };

      const res2 = await Action.getListM(payload2);
      setStats(res1);
      setList(res2);
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
            {empInfo?.EMP_NAME_LC}님 휴가 현황입니다.
          </Text>
          <MovingDateOfArrow
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            gap='year'
            content={
              `${Util.convertDateTime(
                stats?.APPLY_S_DATE,
              )} ~ ${Util.convertDateTime(stats?.APPLY_E_DATE)}` || '-'
            }
          />
          <Board stats={stats} />
          <LVButton
            title='휴가 신청하기'
            onPress={() => {
              movingScreen.navigate('LEA010201', stats);
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
                    movingScreen.navigate('LEA010301', e);
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
    </View>
  );
};
export default LEA010101;

const Board = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={LVStyles.row}>
        <CardOfStats
          title={'적용 일수'}
          days={stats?.VC_QTY}
          textColor='#6A727B'
          bgColor='#F7F8FB'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'사용 일수'}
          days={stats?.VC_QTY - stats?.REM_VC_QTY || 0}
          textColor='#39CCCC'
          bgColor='#EFFBFB'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'잔여 일수'}
          days={stats?.REM_VC_QTY - stats?.VALID_VA_QTY || 0}
          textColor='#27A7FF'
          bgColor='#EEF8FF'
        />
        <View style={{ width: 8 }} />
        <CardOfStats
          title={'신청 일수'}
          days={stats?.VALID_VA_QTY}
          textColor='#939DAA'
          bgColor='#F4F6F8'
        />
      </View>
    </View>
  );
};

const CardOfStats = (props: any) => {
  const { title, days, textColor, bgColor } = props;
  return (
    <View
      style={{
        flex: 1,
        height: 100,
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
          marginBottom: 16,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: textColor, fontSize: 32, fontWeight: '800' }}>
        {days != undefined ? String(days) : '-'}
      </Text>
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
      <View style={[LVStyles.row]}>
        <Text
          style={{
            fontWeight: '600',
            color: '#939DAA',
          }}
        >
          {elem?.VA_TYPE_NAME}
        </Text>
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
      <View style={[LVStyles.row]}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <LVChip
            category='apprStatus'
            title={elem?.AP_STATUS_NAME}
            code={elem?.AP_STATUS}
          />
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              marginHorizontal: 8,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {elem?.VAC_START === elem?.VAC_END
              ? Util.convertDateTime(elem?.VAC_START)
              : Util.convertDateTime(elem?.VAC_START) +
                '...' +
                Util.convertDateTime(elem?.VAC_END)}
          </Text>
        </View>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 14,
            color: '#27A7FF',
          }}
        >
          {/* 휴가 일수 */}
          {elem?.PERIOD} 일
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const MovingDateOfArrow = (props: any) => {
  const { selectedDate, setSelectedDate, gap, content } = props;
  return (
    <View style={[LVStyles.row, { justifyContent: 'center' }]}>
      <Icon
        name='chevron-left'
        color='#939DAA'
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
        name='chevron-right'
        color='#939DAA'
        onPress={() => {
          const temp = selectedDate.add(+1, gap);
          setSelectedDate(temp);
        }}
      />
    </View>
  );
};

const ContentsOfAlert = (props: any) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
      }}
    >
      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          fontWeight: '600',
          color: '#373747',
        }}
      >
        {`연차부여일이 미설정되었습니다.\n인사팀에 문의하세요`}
      </Text>
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
