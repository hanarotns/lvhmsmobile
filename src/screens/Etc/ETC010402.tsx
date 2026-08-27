import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVApprLineForm,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVStyles,
  LVTooltip,
  RefreshControl,
  SafeAreaView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';

type RootStackParamList = {
  DetailScreen: undefined;
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const ETC010402 = () => {
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
  const [approvalLine, setApprovalLine] = useState([]);
  const [certiTypeList, setCertiTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [certiInfo, setCertiInfo] = useState({});

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);

    // 신청자정보 조회
    const payload = {
      EMP_ID: empInfo?.EMP_ID,
    };
    let res1 = await Action.getEmpInfoOfCert(payload);

    setConfig(res1?.[0]);
    let res2 = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'PE_TYPE',
    });

    const sorted = res2.sort(
      (a, b) => sortedArr.indexOf(a.HQCODE) - sortedArr.indexOf(b.HQCODE),
    );

    setCertiTypeList(sorted);
    setLoading(false);
  };

  /**
   * 비즈니스 로직 확인용
   */
  const checkLogic = async () => {
    if (Util.isEmpty(approvalLine)) {
      Util.toastMsg('결재선을 선택하세요', 'info');
      return false;
    }
    if (Util.isEmpty(selectedType)) {
      Util.toastMsg('종류를 선택하세요', 'info');
      return false;
    }
    if (Util.isEmpty(certiInfo?.PE_USE)) {
      Util.toastMsg('용도를 입력하세요', 'info');
      return false;
    }
    if (Util.isEmpty(certiInfo?.SUBMIT_PLACE)) {
      Util.toastMsg('제출처를 입력하세요', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }

    const payload = {
      ...config,
      ...certiInfo,
      PE_TYPE: selectedType?.HQCODE,
      PE_TYPE_NAME: selectedType?.HQNAME,
    };
    setLoading(true);
    const result = await Action.saveApproval(payload, approvalLine);
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
              title={'신청자정보'}
              children={
                <View>
                  <Text>
                    [{config?.DEPT_NAME}] {config?.EMP_NAME}{' '}
                    {config?.POSITION_NAME}
                  </Text>
                </View>
              }
            />
            <LVFormOfContents
              title={'주소'}
              children={
                <View style={styles.addressRow}>
                  <Text style={styles.addressText}>{config?.EMP_ADDR}</Text>
                  <LVTooltip
                    content='※ 주소는 인사정보를 가져와 자동입력됩니다. 정보가 다를 경우 인사팀에 요청하시어 정정하시기 바랍니다.'
                    placement='top'
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={20}
                      color='#777'
                    />
                  </LVTooltip>
                </View>
              }
            />
            <LVFormOfContents
              title={'결재선'}
              children={
                <LVApprLineForm
                  approvalLine={approvalLine}
                  setApprovalLine={setApprovalLine}
                  isButtonDisabled={true}
                />
              }
            />
            <LVFormOfContents
              title={'종류'}
              children={
                <View style={styles.typeListView}>
                  {certiTypeList?.map((e: any) => (
                    <TouchableOpacity onPress={() => setSelectedType(e)}>
                      <LVChip
                        category='type'
                        content={e.HQNAME}
                        chipStyle={{
                          borderColor:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#22A55A'
                              : '#6A727B',
                        }}
                        textStyle={{
                          color:
                            selectedType?.HQCODE === e?.HQCODE
                              ? '#22A55A'
                              : '#6A727B',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />
            <LVFormOfContents
              title={'용도'}
              children={
                <Input
                  placeholder='용도를 입력하세요.'
                  placeholderTextColor='#939DAA'
                  value={certiInfo?.PE_USE}
                  onChangeText={(value) => {
                    setCertiInfo({ ...certiInfo, PE_USE: value });
                  }}
                  style={{ backgroundColor: '#FFF' }}
                  multiline={true}
                />
              }
            />
            <LVFormOfContents
              title={'제출처'}
              children={
                <Input
                  placeholder='제출처를 입력하세요.'
                  placeholderTextColor='#939DAA'
                  value={certiInfo?.SUBMIT_PLACE}
                  onChangeText={(value) => {
                    setCertiInfo({ ...certiInfo, SUBMIT_PLACE: value });
                  }}
                  style={{ backgroundColor: '#FFF' }}
                />
              }
            />
          </View>
        </KeyboardAwareScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'취소'}
            onPress={movingScreen.goBack}
            buttonStyle={LVStyles.whiteBgButton}
            textStyle={LVStyles.whiteBgButtonText}
          />
          {/* 최초 상신 */}
          <LVButton
            title={'상신'}
            onPress={handleSubmit}
            buttonStyle={LVStyles.defaultButton}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default ETC010402;

const sortedArr = ['SL', 'WR', 'PE', 'WC'];

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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    flexShrink: 1,
  },
});
