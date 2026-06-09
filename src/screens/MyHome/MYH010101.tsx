import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import * as icon from '@/src/assets/images';
import {
  Icon,
  KeyboardAwareScrollView,
  Layout,
  LVButton,
  LVColors,
  LVLoadingIndicator,
  LVModal,
  LVProfileImage,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  Text,
  TopNavigationAction,
  withPreventDoubleClick,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Location from 'expo-location';
import * as WLOAction from '../WorkLog/Action'; // API통신 (공통)
import * as Action from './Action';
import LaborNoticeScreen from './LaborNoticeScreen';

const MYH010101 = ({ navigation }) => {
  const TopNavigationActionEx = withPreventDoubleClick(TopNavigationAction); // @@ 필요성 확인!
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

  const [todayInfo, setTodayInfo] = useState({});
  const [nearestOffice, setNearestOffice] = useState({});
  const [position, setPosition] = useState({});
  const [address, setAdress] = useState({});
  const [checkType, setCheckType] = useState('');
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [laborNotice1, setLaborNotice1] = useState([]);
  const [laborNotice2, setLaborNotice2] = useState([]);
  const [laborRefusal, setLaborRefusal] = useState([]);
  const [offsiteInfo, setOffsiteInfo] = useState({});

  useEffect(() => {
    mount();
  }, []);

  // 위치(position)가 세팅되면 그때 사무소 조회하기
  useEffect(() => {
    if (!Util.isEmpty(position)) {
      setNearestOffice({});
      getNearOfficeM();
    }
  }, [position]);

  // 사원정보 저장 후, 나머지 정보도 확인.
  useEffect(() => {
    if (!Util.isEmpty(empInfo)) {
      getLaborInfo();
    }
  }, [empInfo]);

  // 외근등록 모달 껐을 때 외근정보 초기화
  useEffect(() => {
    if (!isVisibleModal) {
      setOffsiteInfo({
        WAT_AREA_NAME: address,
      });
      setCheckType('');
    }
  }, [isVisibleModal]);

  useEffect(() => {
    if (checkType) {
      if (['S', 'E'].includes(checkType)) {
        if (nearestOffice?.ET_STATUS === 'N') {
          setIsVisibleModal(true);
          return;
        } else {
          if (checkType === 'S' && todayInfo?.START_DATETIME) {
            setIsVisibleModal(true);
            return;
          }
          if (checkType === 'E' && todayInfo?.END_DATETIME) {
            setIsVisibleModal(true);
            return;
          }
        }
      }
      if (['O'].includes(checkType)) {
        setIsVisibleModal(true);
        return;
      }
      handleSave();
    }
  }, [checkType]);

  const mount = async () => {
    setLoading(true);
    await getEmpInfoM();
    await getInfoM();
    await getLatLon();
    setLoading(false);
  };

  const getLaborInfo = async () => {
    const payload = {
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_EMP_ID: empInfo?.EMP_ID,
      S_TO_DATE: dayjs(new Date()).format('YYYYMMDD'),
    };
    const res1 = await Action.LaborRefusalNotice(payload);
    setLaborNotice1(res1);
    if (Util.isEmpty(res1)) {
      const res2 = await Action.LaborRefusalNotice2(payload);
      setLaborNotice2(res2);
    }
    const res3 = await Action.LaborRefusal_get(payload);
    setLaborRefusal(res3);
    if (Util.isEmpty(loginInfo)) {
    }
  };

  const getEmpInfoM = async () => {
    const payload = {
      COMPANY_CODE: sessionInfo?.COMPANY_CODE,
      EMP_ID: sessionInfo?.EMP_ID,
    };
    const result = await Action.getEmpInfoM(payload);
    setEmpInfo(result);
  };

  const getInfoM = async () => {
    const payload = {
      WORK_DATE: dayjs(new Date()).format('YYYYMMDD'),
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
    };
    const result = await Action.getInfoM(payload);
    setTodayInfo(result);
  };

  const getLatLon = async () => {
    await getLocation();
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    const latLon = {
      lat: position?.coords?.latitude,
      lon: position?.coords?.longitude,
    };
    setPosition(latLon);
  };

  const getLocation = async () => {
    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      console.log('위치 서비스 ON 여부:', serviceEnabled);

      if (!serviceEnabled) {
        console.log('기기 위치 서비스가 꺼져 있음');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      console.log('권한:', permission.status);

      if (permission.status !== 'granted') {
        console.log('앱 위치 권한 거부됨');
        return;
      }
    } catch (e) {
      console.log('위치 조회 에러:', e);
    }
  };

  const getNearOfficeM = async () => {
    const payload = {
      WA_LAT: position?.lat,
      WA_LON: position?.lon,
    };
    const reverseGeoInfo = await Location.reverseGeocodeAsync({
      latitude: position?.lat,
      longitude: position?.lon,
    });
    const tempAddress = [
      reverseGeoInfo?.[0]?.region,
      reverseGeoInfo?.[0]?.city,
      reverseGeoInfo?.[0]?.district,
    ]
      .filter(Boolean)
      .join(' ');
    setAdress(tempAddress);
    setOffsiteInfo({
      WAT_AREA_NAME: tempAddress,
    });
    const result = await WLOAction.getNearOfficeM(payload);
    setTimeout(() => setNearestOffice(result), 300);
  };

  const saveM = async (checkType: string) => {
    const payload = {
      EMP_ID: empInfo?.EMP_ID,
      WA_LOG_DATETIME: dayjs(new Date()).format('YYYYMMDDHHmmss'),
      WA_LOG_DATE: dayjs(new Date()).format('YYYYMMDD'),
      WA_LOG_TIME: dayjs(new Date()).format('HHmm'),
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
      WA_TYPE: checkType,
      FWH_TYPE: 'S', // 간주근로'A' 미사용으로 선택 일반/선택'S' 하드코딩
      WAT_AREA: nearestOffice.ET_AREA_CODE,
      WAT_AREA_NAME:
        checkType !== 'O'
          ? nearestOffice.ET_AREA_NAME
          : offsiteInfo.WAT_AREA_NAME,
      WAT_AREA_SEQ: nearestOffice.ET_SEQ_NO,
      WAT_STATUS: nearestOffice.ET_STATUS,
      // MOBILE_TOKEN: token,
      // 외근인 경우만.
      OOO_REASON: ` ${offsiteInfo?.OOO_COMPANY} / ${offsiteInfo?.OOO_REASON}`,
    };
    const result = await WLOAction.saveM(payload);
    // 사용자 알림 메시지
    // @@ 공통코드 가져와서 변경 적용.
    if (result.TYPE === 1) {
      let checkTypeNm = '';
      if (checkType === 'S') {
        checkTypeNm = '출근';
      } else if (checkType === 'E') {
        checkTypeNm = '퇴근';
      } else if (checkType === 'O') {
        checkTypeNm = '외근';
      }
      Util.toastMsg(`${checkTypeNm} 기록되었습니다!`);
    }
    await getInfoM();
  };

  const handleSave = async () => {
    if (checkType === 'O') {
      if (
        !(
          offsiteInfo?.WAT_AREA_NAME &&
          offsiteInfo?.OOO_COMPANY &&
          offsiteInfo?.OOO_REASON
        )
      ) {
        Util.toastMsg('입력란을 모두 작성하세요.', 'info');
        return false;
      }
    }
    // 모달 닫기
    setIsVisibleModal(false);
    await saveM(checkType);
    // 근태 타입 초기화
    setCheckType('');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const LayoutOfGreeting = () => {
    const now = dayjs(new Date()).locale('ko');
    const nowOfKo = now.format('MM월 DD일 ddd요일');
    return (
      <View>
        <View style={LVStyles.row}>
          <Text style={styles.greetingText}>
            {`${empInfo?.EMP_NAME_LC}님\n안녕하세요.`}
          </Text>
          <LVProfileImage
            imgStyle={styles.profileImg}
            path={empInfo?.PICTURE_PATH}
          />
        </View>
        <View style={{ height: 12 }} />
        <Text style={styles.greetingSubText}>오늘은 {nowOfKo}</Text>
        <View style={{ height: 12 }} />
      </View>
    );
  };

  const LayoutOfTracker = () => {
    return (
      <View>
        <View style={styles.tracker}>
          {nearestOffice?.ET_STATUS === 'N' && (
            <View style={LVStyles.row}>
              <Image
                source={icon.ico_nolocation}
                style={styles.noLocatedIcon}
              />
              <View style={{ width: 8 }} />
              <Text style={styles.noLocatedText}>
                {!Util.isEmpty(address) ? address : `근무지에서 벗어나 있어요.`}
              </Text>
            </View>
          )}
          {nearestOffice?.ET_STATUS === 'Y' && (
            <View style={LVStyles.row}>
              <Image source={icon.ico_location} style={styles.locatedIcon} />
              <View style={{ width: 8 }} />
              <Text style={styles.locatedText}>
                {nearestOffice?.ET_AREA_NAME}
              </Text>
            </View>
          )}
          {nearestOffice?.ET_STATUS ? (
            <Icon
              onPress={() => {
                setNearestOffice({});
                getNearOfficeM();
              }}
              name='refresh'
              color='#B0B9C1'
            />
          ) : (
            <ActivityIndicator size='large' color='gray' />
          )}
        </View>
        <View style={{ height: 8 }} />
        <View style={styles.trackerBottmView}>
          <Text style={styles.trackerRightText}>
            {todayInfo?.WORK_CODE
              ? todayInfo?.ON_TIME
                ? `정규출퇴근 ${Util.convertDateTime(
                    '',
                    todayInfo?.ON_TIME,
                  )}~${Util.convertDateTime('', todayInfo?.OFF_TIME)}`
                : `휴일`
              : // : `${todayInfo?.CHECK_NAME}` // @@ API 변경사항 있음. (백단 완료 후 재적용)
                `정규출퇴근이 지정되지 않았습니다.\n인사팀에 문의하세요.`}
          </Text>
        </View>
        <View style={{ height: 24 }} />
      </View>
    );
  };

  const LayoutOfCards = () => {
    return (
      <View style={LVStyles.row}>
        <View style={styles.cardArea}>
          <Card
            title={'휴가'}
            img={icon.img_annualleave}
            imgStyle={{ width: 30, height: 86 }}
            onPress={() => {
              movingScreen.navigate('LEA010101');
            }}
            touchable
          />
          <View style={{ height: 12 }} />
          <Card
            title={'시간외'}
            img={icon.img_overtime}
            imgStyle={{ width: 29, height: 40 }}
            onPress={() => {
              movingScreen.navigate('OVT010101');
            }}
            touchable
          />
          <View style={{ height: 12 }} />
          <Card
            title={'결재'}
            cardStyle={{
              minHeight: 191, // @@ 화면에 맞게 flex하게 늘어나는 방법 찾기
              backgroundColor: '#E5EBF3',
              flex: 1,
            }}
            img={icon.img_approval}
            imgStyle={{ width: 96, height: 52 }}
            onPress={() => {
              movingScreen.navigate('APR010101');
            }}
            touchable
          />
        </View>
        <View style={styles.cardArea}>
          <Card
            touchable={false}
            title={'캘린더'}
            onClick={() => {
              movingScreen.navigate('WLO010101');
            }}
            cardStyle={{ minHeight: 272, backgroundColor: '#AADDFF' }}
            moreView={icon.ico_arrow_right}
          >
            <LVButton
              title={'출근하기'}
              img={icon.ico_on}
              subtitle={todayInfo?.START_DATETIME?.substr(11) || '-'}
              buttonStyle={{ backgroundColor: '#EEF8FF', marginTop: 0 }}
              textStyle={styles.startBtnText}
              subTextStyle={{ color: '#1E2125' }}
              imgStyle={{ tintColor: '#27A7FF' }}
              onPress={() => {
                setCheckType('S');
              }}
            />
            <LVButton
              title={'퇴근하기'}
              img={icon.ico_off}
              subtitle={todayInfo?.END_DATETIME?.substr(11) || '-'}
              textStyle={styles.endBtnText}
              buttonStyle={{ backgroundColor: '#D5ECFF', marginTop: 8 }}
              imgStyle={{ tintColor: '#003282' }}
              onPress={() => {
                setCheckType('E');
              }}
            />
            <LVButton
              title={'외근등록'}
              img={icon.ico_out}
              subtitle={
                Util.convertDateTime('', todayInfo?.OFFSITE_TIME) || '-'
              }
              textStyle={styles.offsiteBtnText}
              buttonStyle={{ backgroundColor: '#F7FCFF', marginTop: 8 }}
              imgStyle={{ tintColor: '#373747' }}
              onPress={() => {
                setCheckType('O');
              }}
            />
          </Card>
          <View style={{ height: 12 }} />
          <Card
            title={'급여'}
            cardStyle={{ minHeight: 110, flex: 1 }}
            img={icon.img_pay}
            imgStyle={{ width: 68, height: 40 }}
            onPress={() => {
              movingScreen.navigate('ACC010101');
            }}
            touchable
          />
        </View>
      </View>
    );
  };

  const Card = (props: any) => {
    const {
      onPress,
      onClick,
      title,
      cardStyle,
      img,
      moreView,
      children,
      imgStyle,
      cover,
      touchable,
    } = props;
    const Container = touchable ? TouchableOpacity : View;
    return (
      <Container
        onPress={onPress}
        style={{
          ...styles.cardView,
          ...cardStyle,
        }}
      >
        {moreView ? (
          <TouchableOpacity onPress={onClick} style={styles.cardEntire}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Image source={moreView} style={LVStyles.iconS} />
          </TouchableOpacity>
        ) : (
          <View style={styles.cardEntire}>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
        )}
        {img && (
          <Image
            source={img}
            style={{
              ...styles.cardImage,
              ...imgStyle,
            }}
          />
        )}
        {children}
        {cover && (
          <View style={styles.cardCover}>
            <Image source={icon.ico_build_circle} style={LVStyles.iconS} />
            <View style={{ height: 8 }} />
            <Text style={{ color: '#FFF' }}>Coming Soon</Text>
          </View>
        )}
      </Container>
    );
  };

  return loading ? (
    <LVLoadingIndicator />
  ) : (
    <SafeAreaView>
      {/* 헤더 */}
      <Layout style={styles.entire}>
        <Image source={icon.ico_logo_htns} style={styles.logo} />
        <TouchableOpacity
          onPress={() => {
            movingScreen.navigate('ETC010101');
          }}
        >
          <Image source={icon.ico_account} style={styles.accountIcon} />
        </TouchableOpacity>
      </Layout>
      {/* 본문 */}
      <Layout>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={20}
          style={{ backgroundColor: '#F0F2F6' }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {!Util.isEmpty(laborNotice1) &&
            laborNotice1?.[0]?.LABOR_CHECK === 'N' && (
              // 연차촉진통지
              <LaborNoticeScreen
                type='annual'
                data={laborNotice1[0]}
                onConfirm={() => {
                  console.log('@@ 연차촉진통지 1차');
                  Action.saveRefusalNotice(laborNotice1[0]);
                  setLaborNotice1([]);
                }}
              />
            )}
          {!Util.isEmpty(laborNotice2) &&
            laborNotice2?.[0]?.LABOR_CHECK === 'N' && (
              // 연차촉진통지 2차
              <LaborNoticeScreen
                type='annual'
                data={laborNotice2[0]}
                onConfirm={() => {
                  console.log('@@ 연차촉진통지 2차');
                  Action.saveRefusalNotice(laborNotice2[0]);
                  setLaborNotice2([]);
                }}
              />
            )}
          {!Util.isEmpty(laborRefusal) &&
            Util.isEmpty(laborRefusal?.[0]?.CONFIRM_DATE) && (
              // 노무수령거부통지
              <LaborNoticeScreen
                type='refusal'
                data={laborRefusal[0]}
                onConfirm={() => {
                  console.log('@@ 노무수령거부');
                  const payload = {
                    P_COMPANY_CODE: laborRefusal?.[0]?.COMPANY_CODE,
                    P_EMP_ID: laborRefusal?.[0]?.EMP_ID,
                    P_VA_DATE: laborRefusal?.[0]?.PLAN_VA_DATE,
                    P_JOB_NO: laborRefusal?.[0]?.PLAN_JOB_NO,
                  };
                  Action.LaborRefusal_confirm(payload);
                  setLaborRefusal([]);
                }}
              />
            )}
          {(Util.isEmpty(laborNotice1) ||
            laborNotice1?.[0]?.LABOR_CHECK === 'Y') &&
            (Util.isEmpty(laborNotice2) ||
              laborNotice2?.[0]?.LABOR_CHECK === 'Y') &&
            (Util.isEmpty(laborRefusal) ||
              (!Util.isEmpty(laborRefusal) &&
                !Util.isEmpty(laborRefusal?.[0]?.CONFIRM_DATE))) && (
              <>
                <View style={styles.layout}>
                  <LayoutOfGreeting />
                  <LayoutOfTracker />
                  <LayoutOfCards />
                </View>
                {isVisibleModal &&
                  ['S', 'E'].includes(checkType) &&
                  nearestOffice?.ET_STATUS === 'N' && (
                    <LVModal
                      title={'알림'}
                      titleIcon={icon.ico_warning}
                      contents={<ContentsOfNotInside checkType={checkType} />}
                      onVisible={setIsVisibleModal}
                      onOk={handleSave}
                    />
                  )}
                {isVisibleModal &&
                  ((checkType === 'S' && todayInfo?.START_DATETIME) ||
                    (checkType === 'E' && todayInfo?.END_DATETIME)) && (
                    <LVModal
                      title={'알림'}
                      titleIcon={icon.ico_warning}
                      contents={
                        <ContentsOfDuplicatedRecord checkType={checkType} />
                      }
                      onVisible={setIsVisibleModal}
                      onOk={handleSave}
                    />
                  )}

                {isVisibleModal && checkType === 'O' && (
                  <LVModal
                    title={'외근등록'}
                    titleIcon={icon.ico_out}
                    contents={
                      <ContentsOfOffsite
                        nearestOffice={nearestOffice}
                        offsiteInfo={offsiteInfo}
                        setOffsiteInfo={setOffsiteInfo}
                      />
                    }
                    onVisible={setIsVisibleModal}
                    onOk={handleSave}
                  />
                )}
              </>
            )}
          <View style={{ height: 100 }} />
        </KeyboardAwareScrollView>
      </Layout>
    </SafeAreaView>
  );
};
export default MYH010101;

const ContentsOfOffsite = (props: any) => {
  const { offsiteInfo, setOffsiteInfo } = props;
  return (
    <View>
      {Util.isEmpty(offsiteInfo?.WAT_AREA_NAME) ? (
        <Input
          placeholder='외근 지역을 입력하세요.'
          value={offsiteInfo?.WAT_AREA_NAME}
          onChangeText={(p) => {
            setOffsiteInfo({
              ...offsiteInfo,
              WAT_AREA_NAME: p,
            });
          }}
          size='large'
          style={{ backgroundColor: '#FFF' }}
          textStyle={{ color: '#373747' }}
        />
      ) : (
        <Input value={offsiteInfo?.WAT_AREA_NAME} disabled size='large' />
      )}
      {/* @@ 외근업체 컬럼 없음 */}
      <Input
        placeholder='외근 업체명을 입력하세요.'
        value={offsiteInfo?.OOO_COMPANY}
        onChangeText={(p) => {
          setOffsiteInfo({
            ...offsiteInfo,
            OOO_COMPANY: p,
          });
        }}
        size='large'
        style={{ backgroundColor: '#FFF', marginTop: 8 }}
        textStyle={{ color: '#373747' }}
      />
      <Input
        placeholder='외근 내용을 입력하세요.'
        value={offsiteInfo?.OOO_REASON}
        onChangeText={(p) => {
          setOffsiteInfo({
            ...offsiteInfo,
            OOO_REASON: p,
          });
        }}
        size='large'
        style={{ backgroundColor: '#FFF', marginTop: 8 }}
        textStyle={{ color: '#373747', minHeight: 100 }}
        multiline={true}
      />
    </View>
  );
};

const ContentsOfNotInside = (props: any) => {
  const { checkType } = props;
  return (
    <View style={styles.modalEntire}>
      <Text style={styles.modalText}>근무지 반경에서 벗어나 있어요</Text>
      <View style={{ height: 8 }} />
      <Text style={styles.modalText}>저장하시겠어요?</Text>
      <View style={{ height: 24 }} />
      <Text style={styles.modalImportantText}>
        ※ 반경 외 기록은 유효하지 않습니다
      </Text>
    </View>
  );
};

const ContentsOfDuplicatedRecord = (props: any) => {
  const { checkType } = props;
  let checkTypeName = '';
  if (checkType === 'S') {
    checkTypeName = '출근';
  }
  if (checkType === 'E') {
    checkTypeName = '퇴근';
  }

  return (
    <View style={styles.modalEntire}>
      <Text style={styles.modalText}>
        이전에 저장된 {checkTypeName}기록이 있어요
      </Text>
      <View style={{ height: 8 }} />
      <Text style={styles.modalText}>저장하시겠어요?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  entire: {
    ...LVStyles.row,
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  layout: {
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  greetingText: {
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
  },
  greetingSubText: {
    fontWeight: '600',
    fontSize: 20,
  },
  tracker: {
    ...LVStyles.row,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#444457',
    paddingHorizontal: 16,
  },
  trackerLeftText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#373747',
  },
  trackerRightText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#939DAA',
  },
  cardArea: { width: '48%' },
  modalEntire: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#373747',
  },
  modalImportantText: {
    fontSize: 12,
    fontWeight: '700',
    color: LVColors.warning,
  },
  trackerBottmView: {
    ...LVStyles.row,
    justifyContent: 'flex-end',
    marginHorizontal: 16,
  },
  noLocatedIcon: {
    ...LVStyles.iconS,
    tintColor: '#FF9294',
  },
  noLocatedText: {
    color: '#FF9294',
    fontWeight: '700',
    fontSize: 16,
  },
  locatedIcon: {
    ...LVStyles.iconS,
    tintColor: '#14D46A',
  },
  locatedText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#14D46A',
  },
  startBtnText: {
    color: '#27A7FF',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
  },
  endBtnText: {
    color: '#003282',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
  },
  offsiteBtnText: {
    color: '#373747',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
  },
  cardEntire: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  cardTitle: {
    padding: 8,
    fontWeight: '700',
    fontSize: 16,
    color: '#373747',
  },
  cardImage: { position: 'absolute', right: 12, bottom: 12 },
  cardCover: {
    borderRadius: 8,
    backgroundColor: '#323336BF',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    marginLeft: 32,
    marginTop: 8,
    width: 75,
    height: 16,
  },
  accountIcon: {
    marginTop: 8,
    marginRight: 24,
    ...LVStyles.iconS,
  },
  cardView: {
    width: '100%',
    minHeight: 110,
    borderRadius: 8,
    backgroundColor: '#FFF',
    padding: 8,
  },
});
