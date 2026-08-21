import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVApprLine,
  LVButton,
  LVChip,
  LVConfirmIndicator,
  LVFormOfContents,
  LVLoadingIndicator,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
  const [approvalLine, setApprovalLine] = useState([]);
  const [certiTypeList, setCertiTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [certiInfo, setCertiInfo] = useState({});
  const [dt, setDt] = useState({});

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    setDt(route?.params);

    let res2 = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'PE_TYPE',
    });
    setCertiTypeList(res2);
    setLoading(false);
  };

  const handleDelete = async () => {
    const payload = [
      {
        COMPANY_CODE: dt?.COMPANY_CODE,
        JOB_NO: dt?.JOB_NO,
      },
    ];
    setLoading(true);
    const result = await Action.deleteCertificate(payload);
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
                  <LVChip
                    category='apprStatus'
                    title={dt?.SUBMIT_STATUS_NAME}
                    code={dt?.SUBMIT_STATUS}
                  />
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
        </KeyboardAwareScrollView>
        <View style={LVStyles.bottomButtonView}>
          {dt?.SUBMIT_STATUS === 'W' && (
            <LVButton
              title={'삭제'}
              onPress={handleDelete}
              buttonStyle={LVStyles.grayBgButton}
            />
          )}
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};
export default ETC010403;

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
  apprLineView: {
    ...LVStyles.row,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
});
