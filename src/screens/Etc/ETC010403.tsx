import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  Icon,
  Input,
  KeyboardAwareScrollView,
  LVApprLine,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVFormOfContents,
  LVImage,
  LVLoadingIndicator,
  LVModal,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  Text,
} from '@/src/components';
import { Fetch, Util } from '@/src/lib';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const ETC010403 = () => {
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

  // mount API 기본 정보
  const [dt, setDt] = useState({});
  const [fileList, setFileList] = useState([]);
  const [refusalReason, setRefusalReason] = useState('');

  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [isVisibleAttachModal, setIsVisibleAttachModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    const payload = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      ...route?.params,
    };

    const res = await Action.getDetailMOfCert(payload);

    const apprLine = await COMAction.getApprLineM(res);
    setDt({
      ...route?.params,
      ...res,
      APPR_LINE: apprLine,
    });

    // (첨부파일 관련) 발급 번호 있어야지만 조회
    if (route?.params?.ISSUE_NO) {
      const payloadFile = {
        REF_NO: route?.params?.ISSUE_NO,
        REF_TYPE: 'PT',
        S_FUNC_CODE: 'PT',
      };
      const resFile = await Fetch.getFileList(payloadFile);
      setFileList(resFile.data);
    }
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

  /** 미리보기 */
  const handlePreView = async () => {
    if (dt?.PRINT_COUNT !== 0) {
      Util.toastMsg('출력 불가합니다.', 'info');
    } else {
      setIsVisibleAttachModal(true);
    }
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

  const convertNumbersToStrings = (value) => {
    if (typeof value === 'number') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map(convertNumbersToStrings);
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          convertNumbersToStrings(val),
        ]),
      );
    }

    return value;
  };

  const handleReApprove = async () => {
    const commonInfo = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_DEPT_CODE: empInfo?.DEPT_CODE,
      S_EMP_NAME: empInfo?.EMP_NAME_LC,
      S_EMP_ID: empInfo?.EMP_ID,
      S_EMP_FLAG: 'Y',
    };
    let param = { ...commonInfo, ...dt };
    param = convertNumbersToStrings(param);
    let detail = convertNumbersToStrings(dt?.DETAIL);
    setLoading(true);

    const result = await Action.saveApproval(param, dt?.APPR_LINE);
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

  const handleCloseRefusalModal = () => {
    setIsVisibleModal(false);
    setRefusalReason('');
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
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={180}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.container}>
            <LVFormOfContents
              title={'신청자정보'}
              children={
                <View>
                  <Text>
                    [{dt?.DEPT_NAME}] {dt?.EMP_NAME} {dt?.POSITION_NAME}
                  </Text>
                </View>
              }
            />
            <LVFormOfContents
              title={'주소'}
              children={<Text>{dt?.EMP_ADDR}</Text>}
            />
            <LVFormOfContents
              title={'발급번호'}
              children={
                <View style={[LVStyles.row, { flex: 1 }]}>
                  <Text style={{ fontWeight: '500' }}>
                    {dt?.ISSUE_NO || '-'}
                  </Text>
                  {dt?.AP_STATUS ? (
                    <LVChip
                      category='apprStatus'
                      title={dt?.AP_STATUS_NAME}
                      code={dt?.AP_STATUS}
                    />
                  ) : (
                    <LVChip
                      category='apprStatus'
                      title={dt?.SUBMIT_STATUS_NAME}
                      code={dt?.SUBMIT_STATUS}
                    />
                  )}
                </View>
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <LVChip
                  category='type'
                  content={dt?.PE_TYPE_NAME}
                  chipStyle={styles.typeChip}
                  textStyle={{ color: '#22A55A' }}
                />
              }
            />
            <LVFormOfContents
              title={'용도'}
              children={<Text style={{ fontWeight: '700' }}>{dt?.PE_USE}</Text>}
            />
            <LVFormOfContents
              title={'제출처'}
              children={
                <Text style={{ fontWeight: '700' }}>{dt?.SUBMIT_PLACE}</Text>
              }
            />
            {!Util.isEmpty(dt?.AP_STATUS) && (
              <LVFormOfContents
                title={'결재선'}
                children={
                  <View style={LVStyles.row}>
                    {!Util.isEmpty(dt?.APPR_LINE) ? (
                      <View style={styles.apprLineView}>
                        <LVApprLine data={dt?.APPR_LINE} mainColor='#ABBACD' />
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                }
              />
            )}
            {!Util.isEmpty(fileList) && (
              <LVFormOfContents
                title={'첨부파일'}
                children={
                  <View>
                    <View style={{ ...LVStyles.row, flex: 1 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text numberOfLines={1} style={{ fontWeight: '500' }}>
                          {fileList?.[0]?.FILE_NAME?.length > 15
                            ? `${fileList?.[0]?.FILE_NAME.slice(0, 15)}...`
                            : fileList?.[0]?.FILE_NAME}
                        </Text>
                        {!!(fileList.length > 1) && (
                          <Text> 외 {fileList?.length - 1}건</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => handlePreView()}
                        style={LVStyles.iconWrap}
                      >
                        <Icon name='image-album' color='#27A7FF' />
                      </TouchableOpacity>
                    </View>
                  </View>
                }
              />
            )}
          </View>
        </KeyboardAwareScrollView>
        {dt?.EMP_ID &&
          dt?.AP_STATUS !== 'A' &&
          dt?.EMP_ID === empInfo?.EMP_ID && (
            // 상신자 사용
            <View style={LVStyles.bottomButtonView}>
              {dt?.AP_STATUS === 'S' && (
                <LVButton
                  title={'회수'}
                  onPress={handleRecall}
                  buttonStyle={LVStyles.whiteBgButton}
                  textStyle={LVStyles.whiteBgButtonText}
                />
              )}
              {dt?.AP_STATUS === 'W' && (
                <LVButton
                  title={'삭제'}
                  onPress={handleDelete}
                  buttonStyle={LVStyles.grayBgButton}
                />
              )}
              {dt?.AP_STATUS === 'W' && (
                <LVButton
                  title={'상신'}
                  onPress={handleReApprove}
                  buttonStyle={LVStyles.defaultButton}
                />
              )}
            </View>
          )}
        {dt?.EMP_ID &&
          dt?.AP_STATUS !== 'A' &&
          dt?.EMP_ID !== empInfo?.EMP_ID && (
            // 결재자 사용
            <View style={LVStyles.bottomButtonView}>
              {dt?.LAST_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'회수'}
                  onPress={handleRecallForApprover}
                  buttonStyle={LVStyles.whiteBgButton}
                  textStyle={LVStyles.whiteBgButtonText}
                />
              )}
              {dt?.NEXT_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'반려'}
                  onPress={() => {
                    setIsVisibleModal(true);
                  }}
                  buttonStyle={LVStyles.grayBgButton}
                />
              )}
              {dt?.NEXT_ID === empInfo?.EMP_ID && (
                <LVButton
                  title={'결재'}
                  onPress={handleApproveForApprover}
                  buttonStyle={LVStyles.defaultButton}
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
          onVisible={handleCloseRefusalModal}
          onOk={handleRefusalForApprover}
        />
      )}
      {isVisibleAttachModal && (
        <LVModal
          category='entire'
          title={'첨부파일 미리보기'}
          isUseSaveButton={false}
          contents={<ContentsOfAttach fileList={fileList} />}
          onVisible={setIsVisibleAttachModal}
        />
      )}

      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default ETC010403;

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

const ContentsOfAttach = ({ fileList }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFile = fileList?.[currentIndex];

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const next = () => {
    if (currentIndex < fileList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentFile) return null;

  return (
    <View>
      <LVImage currentFile={currentFile} />
      <View style={styles.moving}>
        <TouchableOpacity onPress={prev} disabled={currentIndex === 0}>
          <Icon name='chevron-left' color='#727283' size={28} />
        </TouchableOpacity>
        <Text>
          {currentIndex + 1} / {fileList.length}
        </Text>
        <TouchableOpacity
          onPress={next}
          disabled={currentIndex === fileList.length - 1}
        >
          <Icon name='chevron-right' color='#373747' size={28} />
        </TouchableOpacity>
      </View>
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
  typeListView: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    borderColor: '#22A55A',
    backgroundColor: '#F1FCF4',
    maxWidth: '80%',
  },
  multilineInput: {
    color: '#373747',
    minHeight: 100,
    textAlignVertical: 'top', // Android에서 상단 정렬
  },
  apprLineView: {
    ...LVStyles.row,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  moving: {
    ...LVStyles.row,
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
