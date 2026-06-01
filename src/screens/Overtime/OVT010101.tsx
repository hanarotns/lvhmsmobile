import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import * as icon from '@/src/assets/images';
import {
  LVButton,
  LVCard,
  LVChip,
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
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
                        if (e?.M_APPR_STATUS === '02') {
                          movingScreen.navigate('OVT010202', elem);
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
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default OVT010101;

const LayoutOfStats = (props: any) => {
  const { stats } = props;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={LVStyles.row}>
        <LVCard
          category='stat'
          label={'연장'}
          value={!Util.isEmpty(stats?.OT_HOURS) ? stats?.OT_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#FFF7EF', height: 60 }}
          valueStyle={{ color: '#FF9E3C', marginBottom: 4, fontSize: 24 }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'추가연장'}
          value={!Util.isEmpty(stats?.BO_HOURS) ? stats?.BO_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#FFF7FF', height: 60 }}
          valueStyle={{ color: '#FF9E99', marginBottom: 4, fontSize: 24 }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'조출'}
          value={!Util.isEmpty(stats?.XX_HOURS) ? stats?.XX_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#FAF9F5', height: 60 }}
          valueStyle={{ color: '#BCAF7F', marginBottom: 4, fontSize: 24 }}
        />
      </View>
      <View style={[LVStyles.row, { marginTop: 8 }]}>
        <LVCard
          category='stat'
          label={'휴일'}
          value={!Util.isEmpty(stats?.HO_HOURS) ? stats?.HO_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#EBF9F2', height: 60 }}
          valueStyle={{ color: '#00B25F', marginBottom: 4, fontSize: 24 }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'재택'}
          value={!Util.isEmpty(stats?.HM_HOURS) ? stats?.HM_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#F6F0EE', height: 60 }}
          valueStyle={{ color: '#924529', marginBottom: 4, fontSize: 24 }}
        />
        <View style={{ width: 8 }} />
        <LVCard
          category='stat'
          label={'당직'}
          value={!Util.isEmpty(stats?.DU_HOURS) ? stats?.DU_HOURS + `h` : `0h`}
          cardStyle={{ backgroundColor: '#EBF5F3', height: 60 }}
          valueStyle={{ color: '#008066', marginBottom: 4, fontSize: 24 }}
        />
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
            <View style={{ width: 8 }} />
            <Text style={{ fontWeight: '700' }}>
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
  confReqButtonText: { color: '#27A7FF', fontSize: 14 },
});
