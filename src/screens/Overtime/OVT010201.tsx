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
  LVDateTimePicker,
  LVFormOfContents,
  LVLoadingIndicator,
  LVModal,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import { Util } from '@/src/lib';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as PALAction from '../PersonalApprovalLine/Action'; // API통신 (개인별 결재선 분리)
import * as Action from './Action'; // API통신

const OVT010201 = () => {
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [approvalLine, setApprovalLine] = useState([]);
  const approvalLineRef = useRef<any>(null);
  const [fromDateTime, setFromDateTime] = useState<Date>(new Date());
  const [toDateTime, setToDateTime] = useState<Date>(new Date());
  const [overtimeTypeList, setOvertimeTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [overtimeInfo, setOvertimeInfo] = useState({}); // 시간외 결재문서 정보
  const [myApprList, setMyApprList] = useState([]);
  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    // 상신자 정보
    const reqMemberInfo = {
      ADD_TYPE: 'U',
      AP_DEPT_CODE: 'HA1300',
      AP_DEPT_NAME: '경영지원그룹',
      AP_DUTY_CODE: 'XX',
      AP_EMP_ID: empInfo?.EMP_ID,
      AP_EMP_NAME: empInfo?.EMP_NAME_LC,
      AP_TYPE: 'SP',
      AP_TYPE_NAME: '상신',
      H_COMPANY_CODE: empInfo?.COMPANY_CODE,
      H_LINE_NO: '0',
      LINE_NO: '0',
      WORK_FLAG: 'W',
      WORK_FS_NAME: '',
      WORK_STATUS: 'W',
    };
    const payload1 = {
      SEARCH_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SEARCH_EMP_ID: empInfo?.EMP_ID,
      SEARCH_EMP_FLAG: 'Y',
      SEARCH_AP_NAME: '',
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_USER_ROLE: 'U',
      P_DUTY_CODE: 'XX',
      P_EMP_ID: empInfo?.EMP_ID,
    };
    // 기존 결재선에 상신자 정보를 할당
    const res01 = await PALAction.getMyApprLine(payload1);
    const updatedRes =
      res01?.map((item) => ({
        ...item,
        DETAILS: [reqMemberInfo, ...(item.DETAILS || [])],
      })) || [];
    setMyApprList(updatedRes);

    const defaultAppr = updatedRes.reduce((prev, curr) => {
      const prevNum = Number(prev.H_TP_SEQ.replace(/\D/g, ''));
      const currNum = Number(curr.H_TP_SEQ.replace(/\D/g, ''));

      return currNum > prevNum ? curr : prev;
    });
    setApprovalLine(defaultAppr?.DETAILS);
    // 시간외 종류 가져오기
    let res02 = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'ND_TYPE',
    });
    setOvertimeTypeList(res02);
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
    };
    const body = {
      F1: approvalInfo,
      G1: approvalLine,
      F2: {
        ...overtimeInfo,
        OT_TYPE: selectedType?.HQCODE, // 시간외 종류
        // 예정 시작 일시
        OT_DATE: fromDateTime.toISOString().substring(0, 10).replace(/-/g, ''),
        ES_START_TIME:
          ('0' + fromDateTime.getHours()).slice(-2) +
          ('0' + fromDateTime.getMinutes()).slice(-2),
        // 확정 시작 일시
        ES_END_DATE: toDateTime
          .toISOString()
          .substring(0, 10)
          .replace(/-/g, ''),
        ES_END_TIME:
          ('0' + toDateTime.getHours()).slice(-2) +
          ('0' + toDateTime.getMinutes()).slice(-2),
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
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      <View style={{ flex: 1 }}>
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
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisibleApprovalModal(true);
                      }}
                      style={{
                        marginLeft: 8,
                        width: 32,
                        height: 32,
                        borderWidth: 2,
                        borderColor: '#27A7FF',
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Icon name='text-box-edit-outline' color='#27A7FF' />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[LVStyles.row, { width: '100%' }]}>
                    <Text>등록된 결재선이 없습니다.</Text>
                    <LVButton
                      title={'결재선 등록'}
                      onPress={() => {
                        movingScreen.navigate('PAL010201');
                      }}
                      buttonStyle={styles.button}
                      textStyle={{
                        color: '#27A7FF',
                      }}
                    />
                  </View>
                )
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {overtimeTypeList?.map((e: any) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedType(e);
                      }}
                    >
                      <LVChip
                        category='type'
                        content={e.HQNAME}
                        chipStyle={{
                          borderColor:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#FF9E3C'
                              : '#6A727B',
                        }}
                        textStyle={{
                          color:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#FF9E3C'
                              : '#6A727B',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />
            <LVFormOfContents
              title={'시작일시'}
              children={
                <LVDateTimePicker
                  date={fromDateTime}
                  setDate={setFromDateTime}
                />
              }
            />
            <LVFormOfContents
              title={'종료일시'}
              children={
                <LVDateTimePicker date={toDateTime} setDate={setToDateTime} />
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={
                <Input
                  value={overtimeInfo?.MEMO}
                  onChangeText={(p) => {
                    setOvertimeInfo({
                      ...overtimeInfo,
                      MEMO: p,
                    });
                  }}
                  size='large'
                  style={{ backgroundColor: '#FFF' }}
                  textStyle={{ color: '#373747', minHeight: 100 }}
                  multiline={true}
                />
              }
            />
          </View>
        </ScrollView>
        <View style={LVStyles.bottomButtonView}>
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
    </SafeAreaView>
  );
};
export default OVT010201;

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
});
