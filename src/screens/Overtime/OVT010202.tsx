import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVApprLineForm,
  LVButton,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import 'dayjs/locale/ko';
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const OVT010202 = () => {
  const movingScreen = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [approvalLine, setApprovalLine] = useState([]);
  const [changeReason, setChangeReason] = useState('');
  const [isCheckOfDate, setIsCheckOfDate] = useState(false);
  const [initTime, setInitTime] = useState('');
  const [changeTime, setChangeTime] = useState('');
  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보
  const [dt, setDt] = useState({});

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    if (initTime !== changeTime) {
      setIsCheckOfDate(true);
    } else {
      setIsCheckOfDate(false);
      setChangeReason('');
      // @@ 다시 확인 할것!
    }
  }, [changeTime]);

  const mount = async () => {
    setLoading(true);
    const res = {};
    // const res = await Action.getDetailM(route.params.APPR_NO);
    setDt(res);
    setApprovalLine(res?.APPR_LINE);
    setInitTime(res?.RA_APPLY_TIME);
    setChangeTime(res?.RA_APPLY_TIME);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (empInfo) return; // @@ 버튼 무효화
    const approvalInfo = {
      APPR_TITLE: '시간외근무신청',
      APPR_TYPE: '02',
      APPR_STATUS: '01',
      APPR_NO: route.params.APPR_NO,
    };
    const body = {
      F1: approvalInfo,
      G1: approvalLine,
      F2: {
        OT_DATE: dt?.OT_DATE,
        OT_TYPE: dt?.OT_TYPE,
        RA_START_TIME: dt?.RA_START_TIME
          ? dt?.RA_START_TIME.substring(0, 4)
          : null,
        RA_END_DATE: dt?.RA_END_DATE,
        RA_END_TIME: dt?.RA_END_TIME ? dt?.RA_END_TIME.substring(0, 4) : null,
        RA_APPLY_TIME: dt?.RA_APPLY_TIME,
        MODIFIED_FLAG: changeReason ? 'Y' : 'N',
        MODIFIED_MEMO: changeReason,
        MODIFIED_TIME: changeTime,
      },
    };
    const result = await Action.save(body);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
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
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.container}>
            <LVFormOfContents
              title={'결재선'}
              children={
                <LVApprLineForm
                  approvalLine={approvalLine}
                  setApprovalLine={setApprovalLine}
                />
              }
            />
            <LVFormOfContents
              title={'예정시간'}
              children={
                <Text style={styles.dateTimeText}>{dt?.M_ES_DATETIME}</Text>
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <View style={styles.typeView}>
                  <Text style={styles.typeText}>{dt?.M_TYPE_NAME}</Text>
                </View>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={<Text style={{ fontWeight: '700' }}>{dt?.M_MEMO}</Text>}
            />
            <LVFormOfContents
              title={'시작일시'}
              children={
                <Text style={styles.dateTimeText}>
                  {Util.convertDateTime('', dt?.RA_START_TIME) || '-'}
                </Text>
              }
            />
            <LVFormOfContents
              title={'종료일시'}
              children={
                <Text style={styles.dateTimeText}>
                  {Util.convertDateTime('', dt?.RA_END_TIME) || '-'}
                </Text>
              }
            />
            {/*  @@ 로직확인 */}
            {/* <LVFormOfContents
            title={'시간변경'}
            children={
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontWeight: '700'}}>
                  {dt?.RA_APPLY_TIME}
                </Text>
                <Icon
                  name='chevron-right'
                  color='#373747'
                  style={[LVStyles.iconS]}
                />
                <Input
                  value={String(changeTime)}
                  onChangeText={e => {
                    setChangeTime(e);
                  }}
                  style={{backgroundColor: '#FFF', width: '30%'}}
                  textStyle={{color: '#373747'}}
                />
                <View style={{width: 16}} />
              </View>
            }
          /> */}
            {isCheckOfDate ? (
              <LVFormOfContents
                title={'변경내용'}
                children={
                  <Input
                    value={changeReason}
                    onChangeText={setChangeReason}
                    size='large'
                    style={{ backgroundColor: '#FFF' }}
                    textStyle={{ color: '#373747', minHeight: 100 }}
                    multiline={true}
                  />
                }
              />
            ) : (
              <></>
            )}
          </View>
        </ScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'취소'}
            onPress={movingScreen.goBack}
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          {/* 최초 상신 */}
          <LVButton
            title={'상신'}
            onPress={handleSubmit}
            buttonStyle={{ flex: 1 }}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default OVT010202;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
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
  myApprListView: {
    display: 'flex',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DCE5',
  },
  myApprListTitleView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  myApprListTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#373747',
  },
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D5DCE5',
  },
  iconWrap: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#27A7FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeText: {
    fontWeight: '700',
    color: '#ABBACD',
  },
  typeView: {
    borderColor: '#FF9E3C',
    backgroundColor: '#FFF7EF',
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
    paddingHorizontal: 12,
    // @@ 크기 유동적으로 수정할 것.
    width: 100,
    alignItems: 'center',
  },
  typeText: {
    color: '#FF9E3C',
    fontSize: 14,
    fontWeight: '700',
  },
});
