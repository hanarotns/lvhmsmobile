import React, { useEffect, useLayoutEffect, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const OVT010301 = ({ navigation }) => {
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
  const [accumulatedHours, setAccumulatedHours] = useState({});
  const [otHours, setOtHours] = useState({});
  const [refusalReason, setRefusalReason] = useState('');

  const [isVisibleModal, setIsVisibleModal] = useState(false);

  useLayoutEffect(() => {
    if (route?.params?.RQ_TYPE_NAME) {
      navigation.setOptions({
        title: route?.params?.RQ_TYPE_NAME + ' 상세',
      });
    }
  }, [navigation]);

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    // 반려내용 모달 껐을 때 반려내용 초기화
    if (!isVisibleModal) {
      setRefusalReason('');
    }
  }, [isVisibleModal]);

  const mount = async () => {
    setLoading(true);
    const payload = {
      COMPANY_CODE: route?.params?.COMPANY_CODE || empInfo?.COMPANY_CODE,
      EMP_ID: route?.params?.RQ_EMP_ID || empInfo?.EMP_ID,
      ...route?.params,
    };
    let detail = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      detail = await Action.getDetailM('nc', payload);
    } else {
      detail = await Action.getDetailM('nd', payload);
    }
    let hours1 = {};
    let hours2 = {};
    if (detail) {
      if (
        !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
        route?.params?.JOB_NO.indexOf('NC') != -1
      ) {
        hours1 = await Action.getAccumulatedHours('nc', detail);
        hours2 = await Action.calTime(detail);
        setOtHours(hours2);
      } else {
        hours1 = await Action.getAccumulatedHours('nd', detail);
      }
      setAccumulatedHours(hours1);
    }
    // API payload 용
    let apprLine = await Action.getApproval33(detail);
    apprLine = apprLine.map((e) => ({
      ...e,
      LINE_ID: e?.LINE_NO,
      APPROVAL_EMP_ID: e?.AP_EMP_ID,
      APPROVAL_EMP_NAME: e?.AP_EMP_NAME,
      APPROVAL_EMP_DEPT_CODE: e?.AP_DEPT_CODE,
      APPROVAL_EMP_DEPT_NAME: e?.AP_DEPT_NAME,
    }));

    const apprLineDisp = await Action.getApprLine({
      ...detail,
      JOB_NO: detail?.CONFIRM_JOB_NO || detail?.JOB_NO,
      APPROVAL_NO: detail?.CONFIRM_APPROVAL_NO || detail?.APPROVAL_NO,
    });
    const sortedApprLineDisp = [...apprLineDisp].sort(
      (a, b) => a.LINE_ID - b.LINE_ID,
    );
    // display 용
    setDt({
      ...route?.params,
      ...detail,
      APPR_LINE: apprLine,
      APPR_LINE_DISP: sortedApprLineDisp,
    });
    setLoading(false);
  };

  /**
   * 비즈니스 로직 확인용
   */
  const checkLogic = async () => {
    if (Util.isEmpty(refusalReason)) {
      Util.toastMsg('반려사유를 입력하세요.', 'info');
      return false;
    }
    return true;
  };

  // 상신자
  const handleRecall = async () => {
    const payload = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      JOB_NO: dt?.JOB_NO,
      CONFIRM_JOB_NO: dt?.CONFIRM_JOB_NO,
    };
    setLoading(true);
    let result = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.recall('nc', payload);
    } else {
      result = await Action.recall('nd', payload);
    }
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
      CONFIRM_JOB_NO: dt?.CONFIRM_JOB_NO,
      CONFIRM_APPROVAL_NO: dt?.CONFIRM_APPROVAL_NO,
    };
    setLoading(true);
    let result = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.deleteMobile('nc', payload);
    } else {
      result = await Action.deleteMobile('nd', payload);
    }
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
    let result = {};
    const payload = {
      ...dt,
      APPLY_WEEK_HOUR: String(
        accumulatedHours?.NC_WEEK_HOUR + otHours?.OVER_TIME,
      ),
      APPLY_MONTH_HOUR: String(
        accumulatedHours?.NC_MONTH_HOUR + otHours?.OVER_TIME,
      ),
      APPLY_HOUR_W: String(otHours?.OVER_TIME),
    };
    setLoading(true);
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.saveApproval('nc', payload, dt?.APPR_LINE);
    } else {
      result = await Action.saveApproval('nd', payload, dt?.APPR_LINE);
    }
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

  const handleCancelSchedule = async () => {
    setLoading(true);
    const result = await Action.cancelSchedule(dt);
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

  // 결재자
  const handleRecallForApprover = async () => {
    const payload1 = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
    };
    const payload2 = [dt];
    setLoading(true);
    let result = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.recallForApprover('nc', payload1, payload2);
    } else {
      result = await Action.recallForApprover('nd', payload1, payload2);
    }
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
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }

    const payload1 = {
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
    };
    const payload2 = [{ ...dt, CANCEL_REMARKS: refusalReason }];
    setLoading(true);
    let result = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.refusalForApprover('nc', payload1, payload2);
    } else {
      result = await Action.refusalForApprover('nd', payload1, payload2);
    }
    setLeaveRefresh(true);
    setLoading(false);
    // 모달 닫기
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setIsVisibleModal(false);
        setConfirming(false);
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
    let result = {};
    if (
      !Util.isEmpty(route?.params?.CONFIRM_JOB_NO) ||
      route?.params?.JOB_NO.indexOf('NC') != -1
    ) {
      result = await Action.approveForApprover('nc', payload1, payload2);
    } else {
      result = await Action.approveForApprover('nd', payload1, payload2);
    }
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
              title={'예정번호'}
              children={
                <View style={[LVStyles.row, { flex: 1 }]}>
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
              title={'예정시간'}
              children={
                <Text style={styles.dateTimeText}>
                  {Util.convertDateTime(
                    dt?.ND_DATE,
                    dt?.ND_TYPE !== 'OT' ? dt?.START_TIME : dt?.NORMAL_OFF_TIME,
                    //@@ ND_TYPE = 'OT' 인 경우 연장시작시간 가져오는 로직으로 수정 필요!!!
                  )}
                  {'~'}
                  {Util.convertDateTime(dt?.CLOSING_DATE, dt?.CLOSING_TIME)}
                </Text>
              }
            />
            {!Util.isEmpty(dt?.CONFIRM_JOB_NO) && (
              <LVFormOfContents
                title={'확정번호'}
                children={
                  <View style={[LVStyles.row, { flex: 1 }]}>
                    <Text style={{ fontWeight: '500' }}>
                      {dt?.CONFIRM_JOB_NO}
                    </Text>
                    <LVChip
                      category='apprStatus'
                      title={dt?.CONFIRM_P_STATUS_NAME}
                      code={dt?.CONFIRM_P_STATUS}
                    />
                  </View>
                }
              />
            )}
            {!Util.isEmpty(dt?.CONFIRM_JOB_NO) && (
              <LVFormOfContents
                title={'확정시간'}
                children={
                  <View>
                    <View style={styles.dateTimevIew}>
                      <Text style={{ fontWeight: '700' }}>
                        {Util.convertDateTime(
                          dt?.CONFIRM_NDS_DATE,
                          dt?.CONFIRM_NDS_TIME,
                        )}
                        {'~'}
                        {Util.convertDateTime(
                          dt?.CONFIRM_NDE_DATE,
                          dt?.CONFIRM_NDE_TIME,
                        )}
                      </Text>
                    </View>
                    <View style={styles.totalTimeView}>
                      <Text style={styles.totalTimeText}>
                        {dt?.NC_HOUR ? `총 ${dt?.NC_HOUR} 시간` : `-`}
                      </Text>
                      {!Util.isEmpty(dt?.NC_CHANGE_REASON) && (
                        <View style={LVStyles.row}>
                          <View style={styles.changeReasonView}>
                            <Text style={styles.changeResonText}>수정됨</Text>
                          </View>
                          <View style={{ width: 8 }} />
                          <Text>{dt?.NC_CHANGE_REASON}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                }
              />
            )}
            <LVFormOfContents
              title={'종류'}
              children={
                <LVChip
                  category='type'
                  content={dt?.ND_TYPE_NM || dt?.ND_TYPE_NAME}
                  chipStyle={styles.typeChip}
                  textStyle={{ color: '#FF9E3C' }}
                />
              }
            />
            <LVFormOfContents
              title={'주누적'}
              children={
                <Text style={{ fontWeight: '700' }}>
                  {dt?.NC_WEEK_HOUR
                    ? `총 ${dt?.NC_WEEK_HOUR || 0} 시간`
                    : `총 ${accumulatedHours?.NC_WEEK_HOUR || 0} 시간`}
                </Text>
              }
            />
            <LVFormOfContents
              title={'월누적'}
              children={
                <Text style={{ fontWeight: '700' }}>
                  {dt?.NC_MONTH_HOUR
                    ? `총 ${dt?.NC_MONTH_HOUR || 0} 시간`
                    : `총 ${accumulatedHours?.NC_MONTH_HOUR || 0} 시간`}
                </Text>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={<Text style={{ fontWeight: '700' }}>{dt?.REASON}</Text>}
            />
            <LVFormOfContents
              title={'결재선'}
              children={
                <View style={LVStyles.row}>
                  {!Util.isEmpty(dt?.APPR_LINE_DISP) ? (
                    <View style={styles.apprLineView}>
                      <LVApprLine
                        data={dt?.APPR_LINE_DISP}
                        mainColor='#ABBACD'
                      />
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              }
            />
          </View>
        </ScrollView>
        {dt?.EMP_ID &&
          (dt?.CONFIRM_JOB_NO
            ? dt?.CONFIRM_P_STATUS !== 'A'
            : dt?.AP_STATUS !== 'A') &&
          dt?.EMP_ID === empInfo?.EMP_ID && (
            // 상신자 사용
            <View style={LVStyles.bottomButtonView}>
              {(dt?.CONFIRM_JOB_NO
                ? dt?.CONFIRM_P_STATUS === 'S'
                : dt?.AP_STATUS === 'S') && (
                <LVButton
                  title={'회수'}
                  onPress={handleRecall}
                  buttonStyle={styles.recallButton}
                  textStyle={styles.recallButtonText}
                />
              )}
              {(dt?.CONFIRM_JOB_NO
                ? dt?.CONFIRM_P_STATUS === 'W'
                : dt?.AP_STATUS === 'W') && (
                <LVButton
                  title={'삭제'}
                  onPress={handleDelete}
                  buttonStyle={LVStyles.deleteButton}
                />
              )}
              {(dt?.CONFIRM_JOB_NO
                ? dt?.CONFIRM_P_STATUS === 'W'
                : dt?.AP_STATUS === 'W') && (
                <LVButton
                  title={'상신'}
                  onPress={handleReApprove}
                  buttonStyle={styles.reApproveButton}
                />
              )}
            </View>
          )}
        {dt?.EMP_ID && dt?.EMP_ID === empInfo?.EMP_ID && (
          <View style={LVStyles.bottomButtonView}>
            {Util.isEmpty(dt?.CONFIRM_JOB_NO) && dt?.AP_STATUS === 'A' && (
              <LVButton
                title={'예정취소'}
                onPress={handleCancelSchedule}
                buttonStyle={styles.cancelScheduleButton}
              />
            )}
          </View>
        )}

        {dt?.EMP_ID &&
          (dt?.CONFIRM_JOB_NO
            ? dt?.CONFIRM_P_STATUS !== 'A'
            : dt?.AP_STATUS !== 'A') &&
          dt?.EMP_ID !== empInfo?.EMP_ID && (
            // 결재자 사용
            <View style={LVStyles.bottomButtonView}>
              {dt?.LAST_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'회수'}
                  onPress={handleRecallForApprover}
                  buttonStyle={styles.recallButton}
                  textStyle={styles.recallButtonText}
                />
              )}
              {dt?.NEXT_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'반려'}
                  onPress={() => {
                    setIsVisibleModal(true);
                  }}
                  buttonStyle={LVStyles.rejectButton}
                />
              )}
              {dt?.NEXT_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'결재'}
                  onPress={handleApproveForApprover}
                  buttonStyle={styles.reApproveButton}
                />
              )}
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
          onOk={handleRefusalForApprover}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default OVT010301;

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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D5DCE5',
  },
  dateTimeText: {
    fontWeight: '700',
    color: '#ABBACD',
  },
  dateTimeView: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  totalTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  totalTimeText: {
    fontWeight: '700',
    color: '#FF9E3C',
  },
  changeReasonView: {
    marginLeft: 16,
    borderColor: '#ABBACD',
    borderWidth: 1,
    borderRadius: 4,
    padding: 6,
    paddingHorizontal: 12,
  },
  changeResonText: {
    color: '#ABBACD',
    fontSize: 12,
    fontWeight: '600',
  },
  typeChip: {
    borderColor: '#FF9E3C',
    backgroundColor: '#FFF7EF',
    maxWidth: 100,
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
  reApproveButton: {
    flex: 1,
    backgroundColor: '#27A7FF',
  },
  cancelScheduleButton: {
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
  apprLineView: {
    ...LVStyles.row,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
});
