import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  LVSelectBox,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
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
import { Calendar } from 'react-native-calendars';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as PALAction from '../PersonalApprovalLine/Action'; // API통신 (개인별 결재선 분리)
import * as WLOAction from '../WorkLog/Action'; // API통신 (달력)

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

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // mount API 기본 정보
  const [officialLeaveType, setOfficialLeaveType] = useState({});
  const [myApprList, setMyApprList] = useState([]);
  // 휴가 HD
  const [hd, setHd] = useState({
    MEMO: '',
    REM_VC_QTY: route?.params.REM_VC_QTY,
    TOTAL_PERIOD: 0,
  });
  // 휴가 DT
  const [infoList, setInfoList] = useState([]);
  const infoRef = useRef<any>(null);
  const [selectedOfficialLeaveType, setSelectedOfficialLeaveType] =
    useState('');
  const [attach, setAttach] = useState([]);
  // 결재선
  const [approvalLine, setApprovalLine] = useState([]);
  const approvalLineRef = useRef<any>(null);

  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);
  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [isVisibleAttachModal, setIsVisibleAttachModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    // 공가 타입 가져오기
    const resOfOfficialLeaveType = await COMAction.getPopup('PC0001', {
      GCODE: 'OFFICIAL_VACATION_REASON',
    });
    setOfficialLeaveType(resOfOfficialLeaveType);
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
    const res = await PALAction.getMyApprLine(payload1);
    const reqMemberInfo = {
      ADD_TYPE: 'U',
      AP_DEPT_CODE: empInfo?.DEPT_CODE,
      AP_DEPT_NAME: empInfo?.DEPT_NAME,
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
    const updatedRes =
      res?.map((item: any) => ({
        ...item,
        DETAILS: [reqMemberInfo, ...(item.DETAILS || [])],
      })) || [];
    setMyApprList(updatedRes);

    if (!route?.params?.APPR_NO) {
      const defaultAppr = updatedRes.reduce((prev, curr) => {
        const prevNum = Number(prev.H_TP_SEQ.replace(/\D/g, ''));
        const currNum = Number(curr.H_TP_SEQ.replace(/\D/g, ''));

        return currNum > prevNum ? curr : prev;
      });
      setApprovalLine(defaultAppr?.DETAILS);
    } else {
      // 변경 상신인 경우.
      setApprovalLine(route.params?.APPR_LINE);
      setHd({
        ...hd,
        MEMO: route?.params?.M_MEMO,
      });
      setInfoList(route.params?.DETAIL);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!Util.isEmpty(selectedOfficialLeaveType)) {
      const targetTypes = ['04', '05', '06'];
      const updatedInfoList = infoList.map((item) =>
        targetTypes.includes(item.LEAVE_TYPE)
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
      setHd({ ...hd, TOTAL_PERIOD: total });
    }
  }, [infoList]);

  /**
   * 비즈니스 로직 확인용
   * * @returns {Boolean}
   */
  const checkLogic = async () => {
    // @@ 로직 더 넣고, 다른화면에도 추가 필요함.
    if (Util.isEmpty(hd?.MEMO)) {
      Util.toastMsg('휴가 신청 내용을 입력하세요', 'info');
      return false;
    }
    return true;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }
    // const approvalInfo = {
    //   APPR_TITLE: '연차신청',
    //   APPR_TYPE: '01',
    //   APPR_STATUS: '01',
    //   APPR_PARAM: route.params?.APPR_NO && 'A',
    //   APPR_NO: route.params?.APPR_NO,
    //   APPR_COMMENT: '1',
    // };
    // const body = {
    //   F1: approvalInfo,
    //   G1: approvalLine,
    //   F2: hd,
    //   G2: infoList,
    // };
    // const result = await Action.saveApproval(body);
    // if (result.TYPE === 1) {
    //   setConfirming(true);
    //   setTimeout(() => {
    //     setConfirming(false);
    //     movingScreen.goBack();
    //   }, 1200);
    // }
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
                ...styles.myApprListView,
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
              <View style={{ flex: 1 }}>
                <View style={styles.myApprListTitleView}>
                  <LVChip category='apprLineFlag' title='일반' />
                  <View style={{ width: 8 }} />
                  <Text style={styles.myApprListTitle}>
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

  const ContentsOfInfo = forwardRef((props: any, ref) => {
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
              const tempDate = dayjs(day?.dateString, 'YYYY-MM-DD').locale(
                'ko',
              );
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
                                  REQ_LEAVE: item.ETC2, // @@ 좋은방식인지 생각해보기
                                  USED_LEAVE: item.ETC3, // @@ 좋은방식인지 생각해보기
                                  LEAVE_TYPE: item.HQCODE, // @@ 좋은방식인지 생각해보기
                                });
                              } else {
                                Util.toastMsg('휴가일자를 선택하세요!', 'info');
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
        )}
      </View>
    );
  });

  const [visiblePhotoList, setVisiblePhotoList] = useState(false);
  const CameraButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setVisiblePhotoList(!visiblePhotoList);
        }}
      >
        <Icon name='content-save-outline' color='#27A7FF' />
      </TouchableOpacity>
    );
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
                !Util.isEmpty(approvalLine) ? (
                  <View style={{ ...LVStyles.row, width: '100%' }}>
                    <LVApprLine
                      data={approvalLine}
                      mainColor={'#373747'}
                      style={{ width: '80%' }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisibleApprovalModal(true);
                      }}
                      style={styles.iconWrap}
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
                      textStyle={{ color: '#27A7FF' }}
                    />
                  </View>
                )
              }
            />
            <LVFormOfContents
              title={'신청정보'}
              children={
                <View style={[LVStyles.row, { flex: 1 }]}>
                  {Util.isEmpty(infoList) && (
                    <View>
                      <Text style={{ color: '#939DAA' }}>
                        우측버튼을 선택하세요.
                      </Text>
                    </View>
                  )}
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
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleInfoModal(true);
                    }}
                    style={styles.iconWrap}
                  >
                    <Icon
                      name={
                        Util.isEmpty(infoList)
                          ? 'plus'
                          : 'text-box-edit-outline'
                      }
                      color='#27A7FF'
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            <LVFormOfContents
              children={
                <View style={[LVStyles.row, { flex: 1, marginVertical: 12 }]}>
                  <View style={styles.leavedayCalculation}>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>
                      잔여 연차
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>
                      {route?.params.REM_VC_QTY}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>-</Text>
                  </View>
                  <View style={styles.leavedayCalculation}>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>
                      신청 연차
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>
                      {hd?.TOTAL_PERIOD}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>=</Text>
                  </View>
                  <View style={styles.leavedayCalculation}>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>
                      이후 연차
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700' }}>
                      {route?.params.REM_VC_QTY - hd?.TOTAL_PERIOD}
                    </Text>
                  </View>
                </View>
              }
            />

            {/* @@ 휴가종류에 '공가'가 포함된 경우만 공가 종류 선택 기능 추가*/}
            {!Util.isEmpty(officialLeaveType) &&
            infoList.find((e) => ['OD', 'OM', 'OA'].includes(e.HQCODE)) ? (
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
                <LVFormOfContents
                  title={'첨부파일'}
                  children={
                    <View style={[LVStyles.row, { flex: 1 }]}>
                      {Util.isEmpty(attach) && (
                        <View>
                          <Text style={{ color: '#939DAA' }}>
                            첨부파일을 선택하세요.
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        {attach.map((e, i) => (
                          <View style={styles.infoListView}>
                            <LVChip
                              category='info'
                              leftText={''}
                              rightText={''}
                              i={i}
                            />
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setIsVisibleAttachModal(true);
                        }}
                        style={styles.iconWrap}
                      >
                        <Icon name='content-save-outline' color='#27A7FF' />
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
            ) : (
              <></>
            )}
            <LVFormOfContents
              title={'내용'}
              children={
                <Input
                  placeholder='휴가내용을 입력하세요.'
                  placeholderTextColor='#939DAA'
                  value={hd.MEMO}
                  onChangeText={(value) => {
                    setHd({
                      ...hd,
                      MEMO: value,
                    });
                  }}
                  size='large'
                  style={{ backgroundColor: '#FFF' }}
                  textStyle={{ color: '#373747', minHeight: 64, fontSize: 14 }}
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
      {isVisibleInfoModal && (
        <LVModal
          category='entire'
          title={'휴가일자와 종류를 추가하세요.'}
          buttonText={'선택'}
          contents={<ContentsOfInfo ref={infoRef} />}
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
          title={'첨부파일을 추가하세요!'}
          buttonText={'선택'}
          contents={
            <View>
              <CameraButton />
            </View>
          }
          onVisible={setIsVisibleAttachModal}
          onOk={() => {
            // @@
          }}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default LEA010201;

const sortedArr = [
  'VY',
  'VM',
  'VA',
  'VO',
  'VOM',
  'VOD',
  'OD',
  'OM',
  'OA',
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
  iconOfarrow: {
    ...LVStyles.iconS,
    tintColor: '#454D58',
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: '#D5DCE5',
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
});
