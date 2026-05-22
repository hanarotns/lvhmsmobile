import * as icon from '@/src/assets/images';
import {
  LVApprLine,
  LVChip,
  LVLoadingIndicator,
  LVModal,
  LVNoData,
  RefreshControl,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import LVStyles from '@/src/components/LVStyles';
import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Image, StyleSheet, View } from 'react-native';

import { Util } from '@/src/lib';
import 'dayjs/locale/ko';

import * as Action from './Action'; // API통신

import { TouchableOpacity } from 'react-native';

import { useIsFocused, useNavigation } from '@react-navigation/native';

const PAL010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  const [myApprList, setMyApprList] = useState([]);
  const approvalLineRef = useRef<any>(null);
  const [selectedAppr, setSelectedAppr] = useState({});

  const [isVisibleDelete, setIsVisibleDelete] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(true);
    const payload1 = {
      SEARCH_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SEARCH_DEPT_CODE: empInfo?.DEPT_CODE,
      SEARCH_EMP_NAME: empInfo?.EMP_NAME_LC,
      SEARCH_EMP_ID: empInfo?.EMP_ID,
      SEARCH_EMP_FLAG: 'Y',
      SEARCH_AP_NAME: '',
      S_COMPANY_CODE: empInfo?.COMPANY_CODE,
      S_TP_SEQ: '',
      SS_EMP_ID: empInfo?.EMP_ID,
      SS_COMPANY_CODE: empInfo?.COMPANY_CODE,
      SS_USER_ROLE: 'U',
      P_DUTY_CODE: '',
      P_EMP_ID: '',
    };
    const res = await Action.getMyApprLine(payload1);
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
    const updatedRes =
      res?.map((item: any) => ({
        ...item,
        DETAILS: [reqMemberInfo, ...(item.DETAILS || [])],
      })) || [];
    setMyApprList(updatedRes);
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const handleDelete = async () => {
    await Action.deleteM({
      H_TP_SEQ: selectedAppr?.H_TP_SEQ,
    });
    await mount();
    setIsVisibleDelete(false);
  };

  const ContentsOfApproval = forwardRef((props: any, ref) => {
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
                marginTop: 16,
                borderWidth: 1,
                // borderRadius: 16,
                borderColor:
                  selectedAppr?.H_TP_SEQ === e?.H_TP_SEQ
                    ? '#27A7FF'
                    : '#6A727B40',
                backgroundColor:
                  selectedAppr?.H_TP_SEQ === e?.H_TP_SEQ ? '#EEF8FF' : '#FFF',
              }}
              onPress={() => {
                setSelectedAppr(e);
                // @@ 화면 만들기
                // movingScreen.navigate('PAL010301');
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <View style={LVStyles.row}>
                  <View style={styles.apprLineView}>
                    <LVChip category='apprLineFlag' title='일반' />
                    <Text style={styles.apprLineNameText}>{e?.AP_NAME}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAppr(e);
                      setIsVisibleDelete(true);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Image
                      style={{ ...LVStyles.iconS, tintColor: '#373747' }}
                      source={icon.ico_delete}
                    />
                  </TouchableOpacity>
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
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {!Util.isEmpty(myApprList) && (
          <View
            style={{
              marginHorizontal: 24,
            }}
          >
            <ContentsOfApproval ref={approvalLineRef} />
          </View>
        )}
        {Util.isEmpty(myApprList) && <LVNoData />}
      </ScrollView>
      {/* 생성 버튼 (플로팅) */}
      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => {
            movingScreen.navigate('PAL010201');
          }}
        >
          <Image source={icon.ico_add} style={LVStyles.iconS} />
        </TouchableOpacity>
      </View>
      {/* 모달 */}
      {isVisibleDelete && (
        <LVModal
          onVisible={setIsVisibleDelete}
          title={'결재선 삭제'}
          contents={<ContentsOfDelete />}
          onOk={handleDelete}
        />
      )}
      {loading && <LVLoadingIndicator />}
    </View>
  );
};
export default PAL010101;

const ContentsOfDelete = (props: any) => {
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
          marginTop: 8,
          fontSize: 16,
          fontWeight: '600',
          color: '#373747',
        }}
      >
        이 결재선을 정말 삭제하시겠어요?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  apprLineView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  apprLineNameText: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
  },
  addIconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#27A7FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
