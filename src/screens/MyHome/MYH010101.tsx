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
  LVLoadingIndicator,
  LVModal,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  Text,
  TopNavigationAction,
  withPreventDoubleClick,
} from '@/src/components'; // 공통컴포넌트
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Location from 'expo-location';
import * as WLOAction from '../WorkLog/Action'; // API통신 (공통)
import * as Action from './Action'; // API통신
import LaborNoticeScreen from './LaborNoticeScreen';

const MYH010101 = ({ navigation }) => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const TopNavigationActionEx = withPreventDoubleClick(TopNavigationAction);

  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [todayInfo, setTodayInfo] = useState({});
  const [nearestOffice, setNearestOffice] = useState({});
  const [mobile, setMobile] = useState({});
  const [position, setPosition] = useState({});
  const [adress, setAdress] = useState({});
  const [checkType, setCheckType] = useState('');
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [laborNotice1, setLaborNotice1] = useState([]);
  const [laborNotice2, setLaborNotice2] = useState([]);
  const [laborRefusal, setLaborRefusal] = useState([]);
  const [offsiteInfo, setOffsiteInfo] = useState({});

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  useEffect(() => {
    // 외근등록 모달 껐을 때 외근정보 초기화
    if (!isVisibleModal) {
      setOffsiteInfo({});
      setCheckType('');
    }
  }, [isVisibleModal]);

  // 위치(position)가 세팅되면 그때 사무소 조회하기
  useEffect(() => {
    if (!Util.isEmpty(position)) {
      setNearestOffice({});
      getNearOfficeM();
      // @@ API key 신규생성 필요함
      // fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position?.lat},${position?.lon}&location_type=ROOFTOP&result_type=street_address&key=AIzaSyDMpeLY-bGH5XbZ6YbCXNW0jaIjITuJxDE` +
      //     '&language=ko',
      // )
      //   .then(response => response.json())
      //   .then(responseJson => {
      //     console.log(
      //       'reverse geo responseJson: \n' + JSON.stringify(responseJson),
      //     );
      //     setAdress(responseJson?.plus_code?.compound_code);
      //     setOffsiteInfo({
      //       ...offsiteInfo,
      //       adressOfGPS: responseJson?.plus_code?.compound_code,
      //     });
      //   })
      //   .catch(err => console.log('reverse geo error : \n' + err));
    }
  }, [position]);

  useEffect(() => {
    if (checkType) {
      if (['S', 'E'].includes(checkType) && nearestOffice?.ET_STATUS === 'Y') {
        handleSave();
        return;
      }
      setIsVisibleModal(true);
    }
  }, [checkType]);

  const mount = async () => {
    setLoading(true);
    const payload = {
      S_COMPANY_CODE: sessionInfo?.COMPANY_CODE,
      S_TO_DATE: dayjs(new Date()).format('YYYYMMDD'),
      S_EMP_ID: sessionInfo?.EMP_ID,
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
    await getEmpInfoM();
    await getInfoM();
    await getLatLon();
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
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
    // const address = await Location.reverseGeocodeAsync({
    //   latitude: position?.lat,
    //   longitude: position?.lon,
    // });
    // console.log('@@ address', address);
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
      WAT_AREA_NAME: nearestOffice.ET_AREA_NAME,
      WAT_AREA_SEQ: nearestOffice.ET_SEQ_NO,
      WAT_STATUS: nearestOffice.ET_STATUS,
      // MOBILE_TOKEN: token,
      // // 외근인 경우만.
      // OOO_GUBUN: oooGubun,
      // OOO_REASON: oooReason,
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
      if (!(offsiteInfo?.adress && offsiteInfo?.name && offsiteInfo?.memo)) {
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

  const LayoutOfGreeting = () => {
    const now = dayjs(new Date()).locale('ko');
    const nowOfKo = now.format('MM월 DD일 ddd요일');
    return (
      <View
        style={{
          marginBottom: 12,
        }}
      >
        <View
          style={{
            ...LVStyles.row,
            marginBottom: 12,
          }}
        >
          <Text style={styles.greetingText}>
            {`${empInfo?.EMP_NAME_LC}님\n안녕하세요.`}
          </Text>
          <Image
            style={styles.profileImg}
            source={
              empInfo?.PICTURE_PATH
                ? {
                    uri: `http://lv1.htns.com/api/apicall/getDownload/${empInfo?.PICTURE_PATH}`,
                    headers: {
                      'X-CSRF-TOKEN': global.gToken,
                      Cookie: global.gCookie,
                      // withCredentials: true,
                    },
                  }
                : icon.ico_profile
            }
          />
        </View>
        <Text style={styles.greetingSubText}>오늘은 {nowOfKo}</Text>
      </View>
    );
  };

  const LayoutOfTracker = () => {
    return (
      <View
        style={{
          marginBottom: 24,
        }}
      >
        <View
          style={{
            ...LVStyles.row,
            ...styles.tracker,
          }}
        >
          {nearestOffice?.ET_STATUS === 'N' && (
            <View style={LVStyles.row}>
              <Image
                source={icon.ico_nolocation}
                style={[
                  LVStyles.iconS,
                  {
                    tintColor: '#FF9294',
                    marginRight: 8,
                  },
                ]}
              />
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: '#FF9294',
                }}
              >
                {
                  // adress?.substring(adress?.indexOf(' '), adress?.length) ||
                  `근무지에서 벗어나 있어요.`
                }
              </Text>
            </View>
          )}
          {nearestOffice?.ET_STATUS === 'Y' && (
            <View style={LVStyles.row}>
              <Image
                source={icon.ico_location}
                style={[
                  LVStyles.iconS,
                  {
                    tintColor: '#14D46A',
                    marginRight: 8,
                  },
                ]}
              />
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: '#14D46A',
                }}
              >
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
              style={{
                ...LVStyles.iconS,
              }}
            />
          ) : (
            <ActivityIndicator size='large' color='gray' />
          )}
        </View>
        <View
          style={{
            ...LVStyles.row,
            marginTop: 8,
            marginHorizontal: 16,
          }}
        >
          <Text style={styles.trackerLeftText}>
            {/* {nearestOffice?.OFFICE_NAME_LOC} */}
          </Text>
          <Text style={styles.trackerRightText}>
            {todayInfo?.WORK_CODE
              ? todayInfo?.ON_TIME
                ? `정규출퇴근 ${Util.convertDateTime(
                    '',
                    todayInfo?.ON_TIME,
                  )}~${Util.convertDateTime('', todayInfo?.OFF_TIME)}`
                : `휴일`
              : // : `${todayInfo?.CHECK_NAME}` // @@ API 변경사항 있음. (백단 완료 후 재적용)
                `정규출퇴근이 지정되지 않았습니다.\n인사팀에 문의하세요.`}{' '}
          </Text>
        </View>
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
              textStyle={{
                color: '#27A7FF',
                fontWeight: '700',
                fontSize: 20,
                lineHeight: 24,
              }}
              subTextStyle={{ color: '#1E2125' }}
              imgStyle={{
                tintColor: '#27A7FF',
              }}
              onPress={() => {
                setCheckType('S');
              }}
            />
            <LVButton
              title={'퇴근하기'}
              img={icon.ico_off}
              subtitle={todayInfo?.END_DATETIME?.substr(11) || '-'}
              textStyle={{
                color: '#003282',
                fontWeight: '700',
                fontSize: 20,
                lineHeight: 24,
              }}
              buttonStyle={{ backgroundColor: '#D5ECFF', marginTop: 8 }}
              imgStyle={{
                tintColor: '#003282',
              }}
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
              textStyle={{
                color: '#373747',
                fontWeight: '700',
                fontSize: 16,
                lineHeight: 24,
              }}
              buttonStyle={{ backgroundColor: '#F7FCFF', marginTop: 8 }}
              imgStyle={{
                tintColor: '#373747',
              }}
              onPress={() => {
                setCheckType('O');
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                right: 30,
                padding: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: '#999FA8',
                }}
              >
                {todayInfo?.OFFSITE_CNT > 1
                  ? `+ ${todayInfo?.OFFSITE_CNT}`
                  : ``}
              </Text>
            </View>
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
        style={[
          {
            width: '100%',
            minHeight: 110,
            borderRadius: 8,
            backgroundColor: '#FFF',
            padding: 8,
          },
          cardStyle,
        ]}
      >
        {moreView ? (
          <TouchableOpacity
            onPress={onClick}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                padding: 8,
                fontWeight: '700',
                fontSize: 16,
                color: '#373747',
              }}
            >
              {title}
            </Text>
            <Image source={moreView} style={[LVStyles.iconS]} />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                padding: 8,
                fontWeight: '700',
                fontSize: 16,
                color: '#373747',
              }}
            >
              {title}
            </Text>
          </View>
        )}
        {img && (
          <Image
            source={img}
            style={[
              {
                position: 'absolute',
                right: 12,
                bottom: 12,
              },
              imgStyle,
            ]}
          />
        )}
        {children}
        {cover && (
          <View
            style={{
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
            }}
          >
            <Image
              source={icon.ico_build_circle}
              style={[
                LVStyles.iconS,
                {
                  marginBottom: 8,
                },
              ]}
            />
            <Text
              style={{
                color: '#FFF',
              }}
            >
              Coming Soon
            </Text>
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
      <Layout
        style={{
          marginVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <Image
          source={icon.ico_logo_htns}
          style={{
            marginLeft: 32,
            marginTop: 8,
            width: 75,
            height: 16,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            movingScreen.navigate('ETC010101');
          }}
        >
          <Image
            source={icon.ico_account}
            style={{
              marginTop: 8,
              marginRight: 24,
              ...LVStyles.iconS,
            }}
          />
        </TouchableOpacity>
      </Layout>
      {/* 본문 */}
      <Layout>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={20}
          style={{
            backgroundColor: '#F0F2F6',
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {!Util.isEmpty(laborNotice1) && (
            // 연차촉진통지
            <LaborNoticeScreen
              type='annual'
              data={laborNotice1[0]}
              onConfirm={() => {
                console.log('확인');
              }}
            />
          )}
          {!Util.isEmpty(laborNotice2) && (
            // 연차촉진통지
            <LaborNoticeScreen
              type='annual'
              data={laborNotice2[0]}
              onConfirm={() => {
                console.log('확인');
              }}
            />
          )}
          {!Util.isEmpty(laborRefusal) && (
            // 노무수령거부통지
            <LaborNoticeScreen
              type='refusal'
              data={laborRefusal[0]}
              onConfirm={() => {
                console.log('확인');
              }}
            />
          )}
          {Util.isEmpty(laborNotice1) &&
            Util.isEmpty(laborNotice2) &&
            Util.isEmpty(laborRefusal) && (
              <>
                <View
                  style={{
                    paddingVertical: 24,
                    paddingHorizontal: 32,
                  }}
                >
                  <LayoutOfGreeting />
                  <LayoutOfTracker />
                  <LayoutOfCards />
                </View>
                {isVisibleModal && ['S', 'E'].includes(checkType) && (
                  <LVModal
                    title={'알림'}
                    titleIcon={icon.ico_warning}
                    contents={<ContentsOfNotInside checkType={checkType} />}
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
      <Input
        placeholder='외근 지역을 입력하세요.'
        value={offsiteInfo?.input}
        onChangeText={(p) => {
          setOffsiteInfo({
            ...offsiteInfo,
            adress: p,
          });
        }}
        size='large'
        style={{ backgroundColor: '#FFF' }}
        textStyle={{ color: '#373747' }}
      />
      <Input
        placeholder='외근 업체명을 입력하세요.'
        value={offsiteInfo?.name}
        onChangeText={(p) => {
          setOffsiteInfo({
            ...offsiteInfo,
            name: p,
          });
        }}
        size='large'
        style={{ backgroundColor: '#FFF', marginTop: 8 }}
        textStyle={{ color: '#373747' }}
      />
      <Input
        placeholder='외근 내용을 입력하세요.'
        value={offsiteInfo?.memo}
        onChangeText={(p) => {
          setOffsiteInfo({
            ...offsiteInfo,
            memo: p,
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
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#373747',
        }}
      >
        근무지 반경에서 벗어나 있어요
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          fontWeight: '600',
          color: '#373747',
        }}
      >
        저장하시겠어요?
      </Text>
      <Text
        style={{
          marginTop: 24,
          fontSize: 12,
          fontWeight: '700',
          color: '#FF676A',
        }}
      >
        ※ 반경 외 기록은 유효하지 않습니다
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textFieldSt: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#27A7FF17',
    borderColor: '#27A7FF',
    borderRadius: 8,
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
  indicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#454D585F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    borderColor: '#fff',
  },
});
