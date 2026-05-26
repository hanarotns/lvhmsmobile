import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  Icon,
  LVApprLine,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVModal,
  LVStyles,
  RefreshControl,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import { Util } from '@/src/lib';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as PALAction from '../PersonalApprovalLine/Action'; // API통신 (개인별 결재선 분리)
import * as Action from './Action'; // API통신

const OVT010202 = () => {
  const movingScreen = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = React.useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [approvalLine, setApprovalLine] = useState([]);
  const approvalLineRef = useRef<any>(null);
  const [changeReason, setChangeReason] = useState('');
  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);
  const [isCheckOfDate, setIsCheckOfDate] = useState(false);
  const [initTime, setInitTime] = useState('');
  const [changeTime, setChangeTime] = useState('');
  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보

  const [myApprList, setMyApprList] = useState([]);
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
    // 상신자 정보
    const reqMemberInfo = {
      SEQ_NO: 0,
      APPR_ROLE: '01',
      APPR_USER: empInfo?.EMP_ID,
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      MEMBER_CODE: empInfo?.EMP_ID,
      NAME_LOC: empInfo?.USER_NAME_LOC,
      APPR_ACTION: '01',
      MINE_YN: 'N',
      OPEN_DATE: dayjs(new Date()).format('YYYYMMDDhhmmss'),
      APPR_DATE: dayjs(new Date()).format('YYYYMMDDhhmmss'),
    };
    // 기존 결재선에 상신자 정보를 할당
    const res01 = await PALAction.getMyApprLine();
    const updatedRes =
      res01?.map((item) => ({
        ...item,
        DETAILS: [reqMemberInfo, ...(item.DETAILS || [])],
      })) || [];
    setMyApprList(updatedRes);
    setApprovalLine(res?.APPR_LINE);
    setInitTime(res?.RA_APPLY_TIME);
    setChangeTime(res?.RA_APPLY_TIME);
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const handleSubmit = async () => {
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

  const ContentsOfApproval = forwardRef((props: any, ref) => {
    const [selectedAppr, setSelectedAppr] = useState({});
    useImperativeHandle(ref, () => ({
      getSelectedValues: () => ({
        selectedAppr,
      }),
    }));

    return (
      <View>
        {myApprList?.map((e, i) => {
          return (
            <TouchableOpacity
              key={e?.H_TP_SEQ || i}
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#D5DCE5',
                borderColor:
                  selectedAppr?.H_TP_SEQ === e?.H_TP_SEQ
                    ? '#27A7FF'
                    : '#6A727B',
                backgroundColor:
                  selectedAppr?.H_TP_SEQ === e?.H_TP_SEQ
                    ? '#EEF8FF'
                    : '#F0F2F6',
              }}
              onPress={() => {
                setSelectedAppr(e);
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <LVChip category='apprLineFlag' title='일반' />
                  <View style={{ width: 8 }} />
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 16,
                      color: '#373747',
                    }}
                  >
                    {e?.APPR_LINE_NAME}
                  </Text>
                </View>
                <View style={{ height: 8 }} />
                <LVApprLine
                  data={e?.DETAILS}
                  mainColor={'#6A727B'}
                  reqApproval={true}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#D5DCE5',
          }}
        >
          <LVFormOfContents
            title={'결재선'}
            children={
              !Util.isEmpty(approvalLine) ? (
                <View style={[LVStyles.row, { width: '100%' }]}>
                  <LVApprLine
                    data={approvalLine}
                    mainColor={'#373747'}
                    style={{
                      width: '80%',
                    }}
                    reqApproval={true}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleApprovalModal(true);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderWidth: 2,
                      borderColor: '#27A7FF',
                      borderRadius: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon
                      name='file-search-outline'
                      color='#27A7FF'
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text>내 결재선관리에서 결재선을 생성하세요.</Text>
              )
            }
          />

          <LVFormOfContents
            title={'예정시간'}
            children={
              <Text
                style={{
                  fontWeight: '700',
                  color: '#ABBACD',
                }}
              >
                {dt?.M_ES_DATETIME}
              </Text>
            }
          />
          <LVFormOfContents
            title={'종류'}
            children={
              <View
                style={{
                  borderColor: '#FF9E3C',
                  backgroundColor: '#FFF7EF',
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 6,
                  paddingHorizontal: 12,
                  // @@ 크기 유동적으로 수정할 것.
                  width: 100,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FF9E3C',
                    fontSize: 14,
                    fontWeight: '700',
                  }}
                >
                  {dt?.M_TYPE_NAME}
                </Text>
              </View>
            }
          />
          <LVFormOfContents
            title={'내용'}
            children={
              <Text
                style={{
                  fontWeight: '700',
                }}
              >
                {dt?.M_MEMO}
              </Text>
            }
          />
          <LVFormOfContents
            title={'시작일시'}
            children={
              <Text
                style={{
                  fontWeight: '700',
                  color: '#ABBACD',
                }}
              >
                {Util.convertDateTime('', dt?.RA_START_TIME) || '-'}
              </Text>
            }
          />
          <LVFormOfContents
            title={'종료일시'}
            children={
              <Text
                style={{
                  fontWeight: '700',
                  color: '#ABBACD',
                }}
              >
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
                  style={{
                    fontWeight: '700',
                  }}>
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
      <View style={styles.bottomButtonView}>
        <LVButton
          title={'취소'}
          onPress={movingScreen.goBack}
          buttonStyle={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <View style={{ width: 8 }} />
        {/* 최초 상신 */}
        <LVButton
          title={'상신'}
          onPress={handleSubmit}
          buttonStyle={{ flex: 1 }}
        />
      </View>
      {isVisibleApprovalModal && (
        <LVModal
          title={'내 결재선을 선택하세요!'}
          buttonText={'선택'}
          contents={<ContentsOfApproval ref={approvalLineRef} />}
          onVisible={setIsVisibleApprovalModal}
          onOk={() => {
            // 1. 자식에서 선택값 가져오기
            const { selectedAppr } =
              approvalLineRef.current.getSelectedValues();
            if (Util.isEmpty(selectedAppr)) {
              Util.toastMsg('선택된 결재선이 없습니다.', 'info');
              return;
            }
            // 2. approvalLine에 추가 (상신자 정보는 하드코딩)
            setApprovalLine([...selectedAppr?.DETAILS]);
            // 3. 모달 닫기
            setIsVisibleApprovalModal(false);
          }}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </View>
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
  bottomButtonView: {
    ...LVStyles.row,
    padding: 32,
    position: 'absolute',
    width: '100%',
    bottom: 0,
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
