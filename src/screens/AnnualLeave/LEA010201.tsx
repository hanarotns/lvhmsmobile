import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  Icon,
  KeyboardAwareScrollView,
  LVApprLineForm,
  LVButton,
  LVChip,
  LVColors,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVModal,
  LVSelectBox,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import ImageAttachment, {
  AttachedImage,
} from '@/src/components/ImageAttachment';
import { Util } from '@/src/lib';
import { calendarTheme } from '@/src/theme/calendarTheme';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as DocumentPicker from 'expo-document-picker';
import { Calendar } from 'react-native-calendars';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as MYHAction from '../MyHome/Action'; // API통신 (파일첨부)
import * as WLOAction from '../WorkLog/Action'; // API통신 (달력)
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const LEA010201 = () => {
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
  const [config, setConfig] = useState({});
  const [officialLeaveType, setOfficialLeaveType] = useState({});
  // 휴가 HD
  const [hd, setHd] = useState({
    REM_VC_QTY: route?.params?.REM_VC_QTY,
    VALID_VA_QTY: route?.params?.VALID_VA_QTY,
    PERIOD: 0,
  });
  // 휴가 DT
  const [infoList, setInfoList] = useState([]);
  const infoRef = useRef<any>(null);
  const [selectedOfficialLeaveType, setSelectedOfficialLeaveType] =
    useState('');
  // const [fileList, setAttach] = useState([]);
  // 결재선
  const [approvalLine, setApprovalLine] = useState([]);
  // 파일 첨부
  const [selectedAttachType, setSelectedAttachType] = useState('photo');
  const [fileList, setFileList] = useState([]);
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [isVisibleAttachModal, setIsVisibleAttachModal] = useState(false);
  const [isPostModal, setIsPostModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    const payload = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_EMP_ID: empInfo?.EMP_ID,
      TO_YEAR: dayjs(new Date()).format('YYYY'),
    };

    const res = await Action.getClearInfo(payload);
    setConfig(res?.[0]);

    // 공가 타입 가져오기
    const resOfOfficialLeaveType = await COMAction.getPopup('PC0001', {
      GCODE: 'OFFICIAL_VACATION_REASON',
    });
    setOfficialLeaveType(resOfOfficialLeaveType);
    // 변경 상신인 경우.
    if (route?.params?.APPR_NO) {
      setApprovalLine(route?.params?.APPR_LINE);
      setHd({
        ...hd,
      });
      setInfoList(route?.params?.DETAIL);
    }
    setLoading(false);
  };

  const generateRefNo = () => {
    const timestamp = Date.now().toString(16);
    const randomPart = Math.random().toString(16).substring(2, 18);
    return `${timestamp}${randomPart}`.substring(0, 32);
  };

  const onPressFileAdd = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const pickedFile = result.assets?.[0];

      if (!pickedFile) {
        return;
      }

      if ((pickedFile.size ?? 0) > 5242880) {
        Util.toastMsg('파일 크기는 5MB 이하여야 합니다.', 'error');
        return;
      }

      setFileList((prev) => [
        ...prev,
        {
          seq: String(prev.length + 1).padStart(2, '0'),
          fileName: pickedFile.name,
          fileSize: `${Math.round((pickedFile.size ?? 0) / 1024)}KB`,
          uri: pickedFile.uri,
          type: pickedFile.mimeType || 'application/octet-stream',
          size: pickedFile.size ?? 0,
          uploaded: false,
        },
      ]);
    } catch (err) {
      console.log('@@ document picker error', err);
      Util.toastMsg('파일을 선택하는 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteFile = async (fileSeq: string) => {
    try {
      const file = fileList.find((f) => f.seq === fileSeq);
      if (!file) return;

      if (file.uploaded && file.FILE_MGT_CODE) {
        await MYHAction.deleteFile(
          file.FILE_MGT_CODE,
          file.YYMMDD,
          file.REF_NO,
          file.FILE_NAME,
          file.COMPANY_CODE,
        );
      }

      setFileList((prev) => prev.filter((f) => f.seq !== fileSeq));
      Util.toastMsg('파일이 삭제되었습니다.', 'success');
    } catch (error) {
      Util.toastMsg('파일 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleSaveFile = async () => {
    try {
      setUploading(true);

      const refNo = fileList?.REF_NO || generateRefNo();
      setHd({
        ...hd,
        ATTACH_NO: refNo,
      });
      const pendingFiles = fileList.filter((f) => !f.uploaded);

      if (pendingFiles.length === 0) {
        Util.toastMsg('업로드할 파일이 없습니다.', 'info');
        setIsVisibleAttachModal(false);
        return;
      }

      const companyCode = sessionInfo?.COMPANY_CODE || 'HTNS';
      const results = await Promise.all(
        pendingFiles.map(async (file) => {
          try {
            const uploaded = await MYHAction.uploadFile(
              file,
              refNo,
              companyCode,
            );
            return {
              ...file,
              uploaded: true,
              FILE_MGT_CODE: uploaded.FILE_MGT_CODE,
              YYMMDD: uploaded.YYMMDD,
              REF_NO: uploaded.REF_NO,
              FILE_NAME: uploaded.FILE_NAME,
              COMPANY_CODE: uploaded.COMPANY_CODE || companyCode,
            };
          } catch (error) {
            Util.toastMsg(`${file.fileName} 업로드 실패`, 'error');
            throw error;
          }
        }),
      );

      setFileList((prev) =>
        prev.map((f) => results.find((r) => r.seq === f.seq) || f),
      );
      setUploadedFiles((prev) => [...prev, ...results]);
      Util.toastMsg('파일 업로드가 완료되었습니다.', 'success');
      setIsVisibleAttachModal(false);
    } catch (error) {
      console.error('파일 업로드 에러:', error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!Util.isEmpty(selectedOfficialLeaveType)) {
      const targetTypes = ['04', '05', '06'];
      const updatedInfoList = infoList.map((item) =>
        targetTypes.includes(item.VA_TYPE)
          ? { ...item, OFFICIAL_LEAVE_TYPE: selectedOfficialLeaveType }
          : item,
      );
      setInfoList(updatedInfoList);
    }
  }, [selectedOfficialLeaveType]);

  useEffect(() => {
    if (!Util.isEmpty(infoList)) {
      const getTotalDAY_02 = (infoList) => {
        return infoList.reduce((sum, item) => {
          return sum + Number(item.DAY_02 || 0);
        }, 0);
      };

      const total = getTotalDAY_02(infoList);
      setHd({ ...hd, PERIOD: total });
    }
  }, [infoList]);

  /**
   * 비즈니스 로직 확인용
   */
  const checkLogic = async () => {
    if (Util.isEmpty(approvalLine)) {
      Util.toastMsg('결재선을 선택하세요', 'info');
      return false;
    }
    if (Util.isEmpty(infoList)) {
      Util.toastMsg('신청정보를 선택하세요', 'info');
      return false;
    }
    if (Util.isEmpty(hd?.REASON)) {
      Util.toastMsg('휴가 신청 내용을 입력하세요', 'info');
      return false;
    }
    const firstVaType = infoList?.[0]?.VA_TYPE;
    if (categoryOfVaType.O.includes(firstVaType)) {
      if (Util.isEmpty(selectedOfficialLeaveType)) {
        Util.toastMsg('공가종류를 선택하세요', 'info');
        return false;
      }
      if (Util.isEmpty(hd?.ATTACH_NO)) {
        Util.toastMsg('첨부파일을 추가하세요', 'info');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }

    const commonInfo = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_DEPT_CODE: empInfo?.DEPT_CODE,
      S_EMP_NAME: empInfo?.EMP_NAME_LC,
      S_EMP_ID: empInfo?.EMP_ID,
      S_EMP_FLAG: 'Y',
    };

    let etcInfo = {};
    const firstVaType = infoList?.[0]?.VA_TYPE;

    if (categoryOfVaType.V.includes(firstVaType)) {
      // @@ 하드코딩 반드시 수정!
      etcInfo = { R_VA_TYPE: 'V', REASON_TYPE: 'P', REASON_CODE: 'P1' };
    } else if (categoryOfVaType.O.includes(firstVaType)) {
      etcInfo = {
        R_VA_TYPE: 'O',
        REASON_TYPE: 'O',
        REASON_CODE: selectedOfficialLeaveType || 'O1',
      };
    } else if (categoryOfVaType.VO.includes(firstVaType)) {
      etcInfo = { R_VA_TYPE: 'V', REASON_TYPE: 'E', REASON_CODE: 'E1' };
    }
    const param = { ...commonInfo, ...hd, ...config, ...etcInfo };

    setLoading(true);
    const result = await Action.saveApproval(param, infoList, approvalLine);
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
              title={'결재선'}
              children={
                <LVApprLineForm
                  approvalLine={approvalLine}
                  setApprovalLine={setApprovalLine}
                />
              }
            />
            <LVFormOfContents
              title={'신청정보'}
              children={
                <View style={{ ...LVStyles.row, flex: 1 }}>
                  {Util.isEmpty(infoList) ? (
                    <Text style={{ color: '#939DAA' }}>
                      우측버튼을 선택하세요.
                    </Text>
                  ) : (
                    <View style={{ flex: 1 }}>
                      {infoList?.map((e, i) => (
                        <View style={styles.infoListView}>
                          <LVChip
                            category='info'
                            leftText={e?.DISP_VA_DATE}
                            rightText={`${e?.HQNAME_03} (${e?.DAY_02})`}
                            i={i}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                  <AddNEditIconButton
                    onVisible={setIsVisibleInfoModal}
                    data={infoList}
                  />
                </View>
              }
            />
            <LVFormOfContents
              children={
                <View style={[LVStyles.row, { flex: 1, marginVertical: 12 }]}>
                  <LeaveDayItem
                    label='잔여 연차'
                    value={
                      route?.params?.REM_VC_QTY - route?.params?.VALID_VA_QTY
                    }
                  />
                  <Text style={styles.operatorText}>-</Text>
                  <LeaveDayItem label='신청 연차' value={hd?.PERIOD} />
                  <Text style={styles.operatorText}>=</Text>
                  <LeaveDayItem
                    label='이후 연차'
                    value={
                      route?.params?.REM_VC_QTY -
                      route?.params?.VALID_VA_QTY -
                      hd?.PERIOD
                    }
                  />
                </View>
              }
            />
            {!Util.isEmpty(officialLeaveType) &&
              infoList?.find((e) => ['OD', 'OM', 'OA'].includes(e.HQCODE)) && (
                <View>
                  <LVFormOfContents
                    title={'공가종류'}
                    children={
                      <View style={styles.selectBoxWrap}>
                        <LVSelectBox
                          onChange={(value: string) => {
                            setSelectedOfficialLeaveType(value);
                          }}
                          data={officialLeaveType}
                          displayField={'HQNAME'}
                          valueField={'HQCODE'}
                        />
                      </View>
                    }
                  />
                </View>
              )}
            <LVFormOfContents
              title={'첨부파일'}
              children={
                <View style={{ ...LVStyles.row, flex: 1 }}>
                  {Util.isEmpty(fileList) ? (
                    <Text style={{ color: '#939DAA' }}>
                      우측버튼을 선택하세요.
                    </Text>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#939DAA' }}>{hd?.ATTACH_NO}</Text>
                    </View>
                  )}
                  <AddNEditIconButton
                    onVisible={setIsVisibleAttachModal}
                    data={fileList}
                  />
                </View>
              }
            />
            <LVFormOfContents
              title={'내용'}
              children={
                <Input
                  placeholder='휴가내용을 입력하세요.'
                  placeholderTextColor='#939DAA'
                  value={hd?.REASON}
                  onChangeText={(value) => {
                    setHd({
                      ...hd,
                      REASON: value,
                    });
                  }}
                  size='large'
                  style={{ backgroundColor: '#FFF' }}
                  textStyle={styles.multilineInput}
                  multiline={true}
                />
              }
            />
          </View>
        </KeyboardAwareScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'취소'}
            onPress={movingScreen.goBack}
            buttonStyle={LVStyles.cancelButton}
            textStyle={LVStyles.cancelButtonText}
          />
          {/* 최초 상신 */}
          <LVButton
            title={'상신'}
            onPress={handleSubmit}
            buttonStyle={{ flex: 1 }}
          />
        </View>
      </View>
      {isVisibleInfoModal && (
        <LVModal
          category='entire'
          title={'휴가일자와 종류를 추가하세요.'}
          buttonText={'선택'}
          contents={<ContentsOfInfo ref={infoRef} route={route} />}
          onVisible={setIsVisibleInfoModal}
          onOk={() => {
            // 1. 자식에서 선택값 가져오기
            const { leaveInfoList } = infoRef.current.getSelectedValues();
            if (Util.isEmpty(leaveInfoList)) {
              Util.toastMsg('선택된 신청정보가 없습니다.', 'info');
              return;
            }
            // 2. infoList에 추가
            setInfoList(leaveInfoList);
            // 3. 모달 닫기
            setIsVisibleInfoModal(false);
          }}
          buttonTop={0}
        />
      )}
      {isVisibleAttachModal && (
        <LVModal
          title={'첨부파일을 선택하세요.'}
          buttonText={'완료'}
          contents={
            <>
              <View style={LVStyles.row}>
                <LVButton
                  title={'사진'}
                  onPress={() => {
                    setSelectedAttachType('photo');
                  }}
                  buttonStyle={{
                    ...styles.button,
                    flex: 1,
                    borderColor:
                      selectedAttachType === 'photo'
                        ? LVColors.primary
                        : LVColors.secondary,
                  }}
                  textStyle={{
                    color:
                      selectedAttachType === 'photo'
                        ? LVColors.primary
                        : LVColors.secondary,
                  }}
                />
                <View style={{ width: 8 }} />
                <LVButton
                  title={'파일'}
                  onPress={() => {
                    setSelectedAttachType('file');
                  }}
                  buttonStyle={{
                    ...styles.button,
                    flex: 1,
                    borderColor:
                      selectedAttachType === 'file'
                        ? LVColors.primary
                        : LVColors.secondary,
                  }}
                  textStyle={{
                    color:
                      selectedAttachType === 'file'
                        ? LVColors.primary
                        : LVColors.secondary,
                  }}
                />
              </View>
              <ScrollView style={{ height: 200, margin: 16 }}>
                {selectedAttachType === 'photo' && (
                  <>
                    <ImageAttachment
                      images={images}
                      onChangeImages={setImages}
                      maxCount={5}
                      setFileList={setFileList}
                    />
                  </>
                )}
                {selectedAttachType === 'file' && (
                  <>
                    <LVButton title='가져오기' onPress={onPressFileAdd} />
                    <View style={{ height: 12 }} />
                    {fileList?.map((elem, i) => (
                      <View
                        style={[styles.infoRow, { alignItems: 'center' }]}
                        key={elem.seq}
                      >
                        <View style={styles.infoValueBox}>
                          <Text style={[styles.infoValueText]}>
                            {elem?.seq}
                          </Text>
                        </View>
                        <View style={{ width: 8 }} />
                        <View style={[styles.infoValueBox, { flex: 1 }]}>
                          <Text style={styles.infoValueText}>
                            {elem?.fileName} ({elem?.fileSize})
                            {elem?.uploaded && ' ✅'}
                          </Text>
                        </View>
                        <View style={{ width: 8 }} />
                        <TouchableOpacity
                          onPress={() => handleDeleteFile(elem.seq)}
                          style={styles.deleteIconWrap}
                        >
                          <Icon name='trash-can-outline' color='#FFFFFF' />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {uploading && (
                      <View style={{ marginTop: 12, alignItems: 'center' }}>
                        <ActivityIndicator size='small' color='#27A7FF' />
                        <Text style={{ color: '#8F9BB3', marginTop: 4 }}>
                          파일 업로드 중...
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </>
          }
          onVisible={setIsVisibleAttachModal}
          onOk={handleSaveFile}
          okDisabled={uploading}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default LEA010201;

const AddNEditIconButton = (props) => {
  const { onVisible, data } = props;
  return (
    <TouchableOpacity
      onPress={() => {
        onVisible(true);
      }}
      style={styles.iconWrap}
    >
      <Icon
        name={Util.isEmpty(data) ? 'plus' : 'text-box-edit-outline'}
        color='#27A7FF'
      />
    </TouchableOpacity>
  );
};

const LeaveDayItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.leavedayCalculation}>
    <Text style={styles.leaveDayLabel}>{label}</Text>
    <Text style={styles.leaveDayValue}>{value}</Text>
  </View>
);

const ContentsOfInfo = forwardRef((props: any, ref) => {
  const { route } = props;

  const isFocused = useIsFocused();

  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState({});
  const [leaveInfoList, setLeaveInfoList] = useState([]);

  const [calDispList, setCalDispList] = useState({});
  const [isVisibleVaTypeModal, setIsVisibleVaTypeModal] = useState(false);

  useImperativeHandle(ref, () => ({
    getSelectedValues: () => ({
      leaveInfoList,
    }),
  }));

  useEffect(() => {
    if (isFocused) {
      let initYearMonth = !Util.isEmpty(selectedInfo?.date)
        ? selectedInfo?.date?.replace(/-/g, '').substring(0, 6)
        : dayjs().format('YYYYMM');
      mount(initYearMonth);
    }
  }, [isFocused]);

  useEffect(() => {
    // 휴가 종류까지 선택하면 값 reset
    if (!Util.isEmpty(selectedInfo?.HQCODE)) {
      // 연차, 공가, 대휴에 따른 동일 타입만 선택 가능한 로직
      const type1 = ['VY', 'VM', 'VA', 'VH', 'VE']; // 연차
      const type2 = ['OD', 'OM', 'OA']; // 공가
      const type3 = ['VO', 'VOM', 'VOD']; // 대휴

      const getType = (hqCode: string) => {
        if (type1.includes(hqCode)) return 'type1';
        if (type2.includes(hqCode)) return 'type2';
        if (type3.includes(hqCode)) return 'type3';
        return null;
      };

      const validateLeaveType = (
        selectedInfo: { HQCODE: string },
        leaveInfoList: { HQCODE: string }[],
      ) => {
        const selectedType = getType(selectedInfo.HQCODE);

        const hasDifferentType = leaveInfoList.some(
          (item) => getType(item.HQCODE) !== selectedType,
        );

        if (hasDifferentType) {
          alert('동일한 휴가 유형만 선택할 수 있습니다.');
          return false;
        }
        return true;
      };
      const result = validateLeaveType(selectedInfo, leaveInfoList);
      if (result) {
        setLeaveInfoList([...leaveInfoList, selectedInfo]);
        setSelectedInfo({});
        setIsVisibleVaTypeModal(false);
      }
    }
  }, [selectedInfo]);

  const mount = async (yearMonthParam: string) => {
    let res = await COMAction.getPopup('PC0008T', {
      VA_TYPE_CODE: '연차',
      WEB_YN: 'Y',
      GCODE: 'VA_TYPE',
      USER_LANG: 'KO',
    });

    res = res
      .filter((e) => sortedArr.includes(e?.HQCODE))
      .map((e) => ({
        ...e,
        ...(customVaType[e.HQCODE] || {}),
      }));

    const sorted = res.sort(
      (a, b) => sortedArr.indexOf(a.HQCODE) - sortedArr.indexOf(b.HQCODE),
    );

    setLeaveTypeList(sorted);

    const payload = {
      YEAR_MONTH: yearMonthParam,
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
    };
    const resOfCal = await WLOAction.getInfoM(payload); // @@ 달력 변경 데이터 넣기
    const obj = {};
    if (!Util.isEmpty(resOfCal)) {
      resOfCal?.HD?.filter((item) =>
        ['HOLIDAY', 'WEEKEND'].includes(item.M_TYPE),
      )
        .map((item) => item.M_DATE)
        .forEach(
          (key: string, i: number) =>
            (obj[key] = {
              customStyles: {
                text: {
                  color: '#FF585B',
                },
              },
            }),
        );
      setCalDispList(obj);
    }
  };

  function toColumnGrid(list, columnCount = 3) {
    const columns = Array.from({ length: columnCount }, () => []);
    list.forEach((item, i) => {
      columns[i % columnCount].push(item);
    });
    // row 우선 변환 (세로 3줄, 가로로)
    const maxRowLen = Math.max(...columns.map((col) => col.length));
    const grid = [];
    for (let r = 0; r < maxRowLen; r++) {
      grid.push(columns.map((col) => col[r] || null));
    }
    return grid; // [ [1,4,7], [2,5,8], [3,6,null] ]
  }
  const columnCount = 3;
  const grid = toColumnGrid(leaveTypeList, columnCount);

  return (
    <View style={{ justifyContent: 'flex-start' }}>
      {/* 신청정보_휴가일자 션택영역 */}
      <View>
        <Calendar
          onDayPress={(day: any) => {
            const YYYYMMDD = day.dateString.replace('-', '').replace('-', '');

            const found = leaveInfoList.some((item) => {
              return item.date === day.dateString;
            });
            if (found) {
              Alert.alert('알림', '이미 선택한 휴가일자입니다!');
              return;
            }
            if (
              route?.params?.APPLY_S_DATE > YYYYMMDD ||
              route?.params?.APPLY_E_DATE < YYYYMMDD
            ) {
              Alert.alert(
                '알림',
                `연차 신청 가능 일자가 아닙니다! \n * 신청 가능 기간: ${route?.params?.APPLY_S_DATE}~${route?.params?.APPLY_E_DATE}`,
              );
              return;
            }
            const tempDate = dayjs(day?.dateString, 'YYYY-MM-DD').locale('ko');
            setSelectedInfo({
              ...selectedInfo,
              date: day.dateString,
              VA_DATE: day.dateString.replace('-', '').replace('-', ''),
              DISP_VA_DATE: `${day.dateString} (${tempDate.format('ddd')})`,
            });
            setIsVisibleVaTypeModal(true);
          }}
          onMonthChange={(month: any) => {
            const date = month.dateString;
            setSelectedInfo({
              date,
            });
            const yearMonth = date.replace(/-/g, '').substring(0, 6);
            mount(yearMonth);
          }}
          markingType='custom'
          markedDates={{
            ...calDispList,
            [selectedInfo?.date]: {
              selected: true,
              disableTouchEvent: true,
              selectedDotColor: 'orange',
            },
          }}
          monthFormat='yyyy년 M월'
          renderArrow={(direction: any) => (
            <Icon
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              color='gray'
            />
          )}
          theme={calendarTheme}
        />
      </View>
      {/* 선택한 신청정보 표시영역 */}
      <View style={styles.selectedDisp}>
        <ScrollView style={{ width: '100%' }}>
          <View style={{ alignItems: 'center' }}>
            {leaveInfoList.map((e: any, i: number) => (
              <View style={styles.chipView}>
                <LVChip
                  category='info'
                  leftText={e?.DISP_VA_DATE}
                  rightText={`${e?.HQNAME_03} (${e?.DAY_02})`}
                  i={i}
                  onPress={() => {
                    setLeaveInfoList((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
                  }}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      {/* 신청정보_휴가종류 션택영역 */}
      {isVisibleVaTypeModal && (
        <Modal
          transparent
          animationType='fade'
          onRequestClose={() => {
            setIsVisibleVaTypeModal(false);
          }}
        >
          <View style={styles.overlay}>
            <LVModal
              title={'종류를 선택하세요'}
              buttonText={'선택'}
              contents={
                <View style={styles.modalView}>
                  {grid.map((row, rowIdx) => {
                    return (
                      <View key={rowIdx} style={styles.modalInsideView}>
                        {row.map((item, colIdx) =>
                          item ? (
                            <TouchableOpacity
                              key={item?.HQCODE || colIdx}
                              onPress={() => {
                                if (selectedInfo?.date) {
                                  setSelectedInfo({
                                    ...selectedInfo,
                                    ...item,
                                    PERIOD: item.DAY_01, // @@ 좋은방식인지 생각해보기
                                    VA_PERIOD: item.DAY_02, // @@ 좋은방식인지 생각해보기
                                    VA_TYPE: item.HQCODE, // @@ 좋은방식인지 생각해보기
                                    VA_TYPE_NAME: item.HQNAME, // @@ 좋은방식인지 생각해보기
                                  });
                                } else {
                                  Util.toastMsg(
                                    '휴가일자를 선택하세요!',
                                    'info',
                                  );
                                }
                              }}
                              activeOpacity={0.8}
                              style={{
                                marginRight: colIdx < columnCount - 1 ? 8 : 0,
                              }}
                            >
                              <LVChip
                                category='type'
                                content={item?.HQNAME_02}
                                subContent={item?.HQNAME_01}
                                chipStyle={{
                                  width: 60,
                                  borderColor:
                                    selectedInfo?.HQCODE === item?.HQCODE
                                      ? '#39CCCC'
                                      : '#6A727B',
                                }}
                                textStyle={{
                                  color:
                                    selectedInfo?.HQCODE === item?.HQCODE
                                      ? '#39CCCC'
                                      : '#6A727B',
                                }}
                              />
                            </TouchableOpacity>
                          ) : (
                            // 마지막 줄이 비는 경우, 빈 뷰로 공간 맞추기
                            <View
                              key={colIdx}
                              style={{
                                width: 60,
                                marginRight: colIdx < columnCount - 1 ? 8 : 0,
                              }}
                            />
                          ),
                        )}
                      </View>
                    );
                  })}
                </View>
              }
              onVisible={setIsVisibleVaTypeModal}
              onOk={() => {}}
            />
          </View>
        </Modal>
      )}
    </View>
  );
});

const sortedArr = [
  'VY',
  'VM',
  'VA',
  'OD',
  'OM',
  'OA',
  'VO',
  'VOM',
  'VOD',
  'VH',
  'VE',
];

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
    DAY_02: 0,
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

const categoryOfVaType = {
  V: ['VY', 'VM', 'VA', 'VH', 'VE'], // 연차
  O: ['OD', 'OM', 'OA'], // 공가
  VO: ['VO', 'VOM', 'VOD'], // 대휴
};

const COLORS = {
  screen: '#F6F7FB',
  white: '#FFFFFF',
  border: '#E5E9F0',
  text: '#222B45',
  subText: '#8F9BB3',
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
  },
  selectedDisp: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    height: '100%',
    padding: 8,
  },
  chipView: {
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalView: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  infoListView: {
    height: 48,
    justifyContent: 'center',
  },
  leavedayCalculation: {
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBoxWrap: {
    flex: 1,
    width: '70%',
    justifyContent: 'center',
  },
  modalInsideView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  leaveDayLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaveDayValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  operatorText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
  },
  conditionWrap: {
    marginBottom: 14,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineFieldRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  inlineLabel: {
    width: 52,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.subText,
    marginRight: 10,
  },
  selectWrap: {
    flex: 1,
  },
  select: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  searchButton: {
    width: 80,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27A7FF',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  selectedCard: {
    backgroundColor: '#27A7FF17',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27A7FF',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  blockTitleNoMargin: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  smallOutlineButton: {
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallOutlineButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27A7FF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoRowNoMargin: {
    flexDirection: 'row',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  infoColLast: {
    marginRight: 0,
  },
  infoColFull: {
    flex: 1,
  },
  infoLabel1: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subText,
    marginBottom: 6,
    width: '30%',
  },
  infoLabel2: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subText,
    marginBottom: 6,
  },
  infoValueBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  infoTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoValueText: {
    fontSize: 14,
    color: COLORS.text,
  },
  input: {
    minHeight: 58,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  inputText: {
    minHeight: 28,
    textAlignVertical: 'top',
  },
  remarkInput: {
    minHeight: 92,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  remarkInputText: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  searchIconButton: {
    marginLeft: 8,
    padding: 4,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#27A7FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconWrap: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FF3D71',
  },
  multilineInput: {
    color: '#373747',
    minHeight: 100,
    textAlignVertical: 'top', // Android에서 상단 정렬
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
