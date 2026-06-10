import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  LVApprLine,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVModal,
  LVProfileImage,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Action from './Action';
type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const LEA010301 = () => {
  const movingScreen = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const setLeaveRefresh = useRefreshStore((state) => state.setLeaveRefresh);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [dt, setDt] = useState({});
  const [refusalReason, setRefusalReason] = useState('');

  const [isVisibleModal, setIsVisibleModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    // 반려사유 모달 껐을 때 반려사유 초기화
    if (!isVisibleModal) {
      setRefusalReason('');
    }
  }, [isVisibleModal]);

  const mount = async () => {
    setLoading(true);
    const payload = {
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      EMP_ID: empInfo?.EMP_ID,
      JOB_NO: route?.params?.JOB_NO,
      APPROVAL_NO: route?.params?.APPROVAL_NO,
    };
    const res = await Action.getDetailM(payload);
    let detail = await Action.getDt(payload);

    detail = detail.map((e) => ({
      ...e,
      ...(customVaType[e.VA_TYPE] || {}),
    }));

    const apprLine = await Action.getApprLine(payload);

    const sortedApprLine = [...apprLine].sort((a, b) => a.LINE_ID - b.LINE_ID);

    setDt({
      ...route?.params,
      ...res,
      DETAIL: detail,
      APPR_LINE: sortedApprLine,
    });

    setLoading(false);
  };

  // 상신자
  const handleRecall = async () => {
    const payload = {
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      JOB_NO: dt?.JOB_NO,
    };
    setLoading(true);
    const result = await Action.recall(payload);
    setLeaveRefresh(true);
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleDelete = async () => {
    const payload = {
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      JOB_NO: dt?.JOB_NO,
      APPROVAL_NO: dt?.APPROVAL_NO,
    };
    setLoading(true);
    const result = await Action.deleteMobile(payload);
    setLeaveRefresh(true);
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleReApprove = async () => {
    setLoading(true);
    const result = await Action.saveApproval(dt, dt?.DETAIL, dt?.APPR_LINE);
    setLeaveRefresh(true);
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleAgain = async () => {
    if (empInfo) return; // @@ 버튼 무효화
    movingScreen.dispatch(StackActions.replace('LEA010201'), dt);
  };

  // 결재자
  const handleRecallForApprover = async () => {
    const payload1 = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
    };
    const payload2 = [dt];
    setLoading(true);
    const result = await Action.recallForApprover(payload1, payload2);
    setLeaveRefresh(true);
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleRefusalForApprover = async () => {
    const payload1 = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
    };
    const payload2 = [{ ...dt, CANCEL_REMARKS: refusalReason }];
    setLoading(true);
    const result = await Action.refusalForApprover(payload1, payload2);
    setLeaveRefresh(true);
    setLoading(false);
    // 모달 닫기
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        setIsVisibleModal(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleApproveForApprover = async () => {
    const payload1 = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
    };
    const payload2 = [dt];
    setLoading(true);
    const result = await Action.approveForApprover(payload1, payload2);
    setLeaveRefresh(true);
    setLoading(false);
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
              title={'신청자정보'}
              children={
                <>
                  {!Util.isEmpty(dt) && (
                    <View
                      style={[
                        LVStyles.row,
                        { flex: 1, justifyContent: 'flex-start', gap: 8 },
                      ]}
                    >
                      <LVProfileImage
                        imgStyle={styles.profileImg}
                        path={dt?.PICTURE_PATH}
                      />
                      <Text style={{ fontWeight: '500' }}>
                        {!Util.isEmpty(dt?.DEPT_NAME)
                          ? `[${dt?.DEPT_NAME}] ${dt?.EMP_NAME}`
                          : `[${dt?.RQ_DEPT_NAME}] ${dt?.RQ_EMP_NAME}`}
                      </Text>
                    </View>
                  )}
                </>
              }
            />
            <LVFormOfContents
              title={'문서번호'}
              children={
                <View style={{ ...LVStyles.row, flex: 1, marginRight: 16 }}>
                  <Text style={{ fontWeight: '500' }}>{dt?.JOB_NO}</Text>
                  <LVChip
                    category='apprStatus'
                    title={dt?.AP_STATUS_NAME}
                    code={dt?.AP_STATUS}
                  />
                </View>
              }
            />
            <LVFormOfContents
              title={'신청정보'}
              children={
                <View style={styles.infoView}>
                  <View>
                    {dt?.DETAIL?.map((e, i) => (
                      <View style={styles.detailView}>
                        <LVChip
                          category='info'
                          leftText={`${Util.convertDateTime(e?.VA_DATE)} (${dayjs(e?.VA_DATE, 'YYYYMMDD').locale('ko').format('ddd')})`}
                          rightText={`${e?.HQNAME_03} (${e?.DAY_02})`}
                          i={i}
                          chipStyle={{ marginBottom: 0 }}
                        />
                      </View>
                    ))}
                    <View style={styles.totalCntView}>
                      <Text style={styles.totalCntText}>
                        {`총 ${dt?.PERIOD || '0'} 일`}
                      </Text>
                    </View>
                  </View>
                </View>
              }
            />
            <LVFormOfContents
              title={'첨부파일'}
              children={
                <Text style={{ fontWeight: '500' }}>
                  {dt?.ATTACH_NO || `-`}
                </Text>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={
                <Text style={{ fontWeight: '700' }}>{dt?.REASON || `-`}</Text>
              }
            />
            {/* @@ 상신 일시 신청 전 기준이라는 것을 명시하는게 좋을 것 같음. (사용자가 혼란을 겪을 수 있음.) */}
            {/* <LVFormOfContents
            title={'잔여연차'}
            children={
              <Text style={{fontWeight: '700'}}>
                {dt?.REM_VC_QTY}
              </Text>
            }
          /> */}
            <LVFormOfContents
              title={'결재선'}
              children={
                <View style={LVStyles.row}>
                  {!Util.isEmpty(dt?.APPR_LINE) ? (
                    <View
                      style={{
                        ...LVStyles.row,
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap',
                      }}
                    >
                      <LVApprLine data={dt?.APPR_LINE} mainColor='#ABBACD' />
                    </View>
                  ) : (
                    <Text>내 결재선관리에서 결재선을 생성하세요.</Text>
                  )}
                </View>
              }
            />
          </View>
        </ScrollView>
        {dt?.EMP_ID &&
          dt?.AP_STATUS !== 'A' &&
          dt?.EMP_ID === empInfo?.EMP_ID && (
            // 상신자 사용
            <View style={LVStyles.bottomButtonView}>
              {dt?.AP_STATUS === 'S' && (
                <LVButton
                  title={'회수'}
                  onPress={handleRecall}
                  buttonStyle={styles.recallButton}
                  textStyle={styles.recallButtonText}
                />
              )}
              {dt?.AP_STATUS === 'W' && (
                <LVButton
                  title={'삭제'}
                  onPress={handleDelete}
                  buttonStyle={styles.cancelButton}
                />
              )}
              {dt?.AP_STATUS === 'W' && (
                <LVButton
                  title={'상신'}
                  onPress={handleReApprove}
                  buttonStyle={styles.reApproveButton}
                />
              )}
            </View>
          )}
        {dt?.EMP_ID && dt?.EMP_ID === empInfo?.EMP_ID && (
          // 상신자 사용, 결재완료 상태에서 변경 / 취소 가능함 추가
          <View style={LVStyles.bottomButtonView}>
            {dt?.AP_STATUS === 'A' &&
              false && ( // @@ 버튼 임시 비활성화
                <LVButton
                  title={'변경'}
                  onPress={handleAgain}
                  buttonStyle={styles.reApproveButton}
                />
              )}
          </View>
        )}
        {dt?.EMP_ID &&
          dt?.AP_STATUS !== 'A' &&
          dt?.EMP_ID !== empInfo?.EMP_ID && (
            // 결재자 사용
            <View style={LVStyles.bottomButtonView}>
              <LVButton
                title={'회수'}
                onPress={handleRecallForApprover}
                buttonStyle={styles.recallButton}
                textStyle={styles.recallButtonText}
              />
              <LVButton
                title={'반려'}
                onPress={() => {
                  setIsVisibleModal(true);
                }}
                buttonStyle={styles.cancelButton}
              />
              <LVButton
                title={'결재'}
                onPress={handleApproveForApprover}
                buttonStyle={styles.reApproveButton}
              />
            </View>
          )}
      </View>
      {isVisibleModal && (
        <LVModal
          title={'반려'}
          contents={
            <ContentsOfRefusal
              refusalReason={refusalReason}
              setRefusalReason={setRefusalReason}
            />
          }
          onVisible={setIsVisibleModal}
          onOk={() => {
            handleRefusalForApprover();
          }}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default LEA010301;

const ContentsOfRefusal = (props: any) => {
  const { refusalReason, setRefusalReason } = props;
  return (
    <View>
      <Input
        placeholder='반려내용을 입력하세요'
        value={refusalReason}
        onChangeText={(p) => {
          setRefusalReason(p);
        }}
        size='large'
        style={{ backgroundColor: '#FFF' }}
        textStyle={styles.multilineInput}
        multiline={true}
      />
    </View>
  );
};

const customVaType = {
  VY: {
    HQNAME_01: '연차',
    HQNAME_02: '종일',
    HQNAME_03: '연차',
    DAY_01: 1,
    DAY_02: 1,
  },
  VM: {
    HQNAME_01: '반차',
    HQNAME_02: '오전',
    HQNAME_03: '오전반차',
    DAY_01: 0.5,
    DAY_02: 0.5,
  },
  VA: {
    HQNAME_01: '반차',
    HQNAME_02: '오후',
    HQNAME_03: '오후반차',
    DAY_01: 0.5,
    DAY_02: 0.5,
  },
  VH: {
    HQNAME_01: '',
    HQNAME_02: '보건',
    HQNAME_03: '보건',
    DAY_01: 1,
    DAY_02: 1,
  },
  VE: {
    HQNAME_01: '',
    HQNAME_02: '조퇴',
    HQNAME_03: '조퇴',
    DAY_01: 0,
    DAY_02: 0,
  },
  AA: {
    HQNAME_01: '',
    HQNAME_02: '조퇴',
    HQNAME_03: '조퇴',
    DAY_01: 0,
    DAY_02: 0,
  },
  VO: {
    HQNAME_01: '대휴',
    HQNAME_02: '종일',
    HQNAME_03: '대체휴가',
    DAY_01: 1,
    DAY_02: 0,
  },
  VOM: {
    HQNAME_01: '대휴',
    HQNAME_02: '오전',
    HQNAME_03: '오전대체휴가',
    DAY_01: 0.5,
    DAY_02: 0,
  },
  VOD: {
    HQNAME_01: '대휴',
    HQNAME_02: '오후',
    HQNAME_03: '오후대체휴가',
    DAY_01: 0.5,
    DAY_02: 0,
  },
  OD: {
    HQNAME_01: '공가',
    HQNAME_02: '종일',
    HQNAME_03: '공가',
    DAY_01: 1,
    DAY_02: 0,
  },
  OM: {
    HQNAME_01: '공가',
    HQNAME_02: '오전',
    HQNAME_03: '오전공가',
    DAY_01: 0.5,
    DAY_02: 0,
  },
  OA: {
    HQNAME_01: '공가',
    HQNAME_02: '오후',
    HQNAME_03: '오후공가',
    DAY_01: 0.5,
    DAY_02: 0,
  },
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#D5DCE5',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    padding: 16,
  },
  infoView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailView: {
    height: 48,
    justifyContent: 'center',
  },
  totalCntView: {
    height: 48,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  totalCntText: {
    color: '#39CCCC',
    fontWeight: '700',
    fontSize: 14,
  },
  recallButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D5DCE5',
  },
  recallButtonText: {
    color: '#373747',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#939DAA',
  },
  reApproveButton: {
    flex: 1,
    backgroundColor: '#27A7FF',
  },
  multilineInput: {
    color: '#373747',
    minHeight: 100,
    textAlignVertical: 'top', // Android에서 상단 정렬
  },
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
