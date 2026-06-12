import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import * as icon from '@/src/assets/images';
import {
  Icon,
  LVApprLine,
  LVApprList,
  LVButton,
  LVModal,
  LVStyles,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import * as PALAction from '@/src/screens/PersonalApprovalLine/Action'; // API통신 (개인별 결재선 분리)
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import 'dayjs/locale/ko';

const LVApprLineForm = (props: any) => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();

  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [myApprList, setMyApprList] = useState([]);
  const { approvalLine, setApprovalLine } = props;
  const approvalLineRef = useRef<any>(null);
  const [approvalInfo, setApprovalInfo] = useState([]);

  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    const reqMemberInfo = {
      // 상신자 정보
      AP_TYPE: 'SP',
      AP_TYPE_NAME: '상신',
      ADD_TYPE: 'U',
      AP_DEPT_CODE: empInfo?.DEPT_CODE,
      AP_DEPT_NAME: empInfo?.DEPT_NAME,
      AP_DUTY_CODE: 'XX',
      AP_EMP_ID: empInfo?.EMP_ID,
      AP_EMP_NAME: empInfo?.EMP_NAME_LC,
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
    const res = await PALAction.getMyApprLine(payload1);
    const updatedRes =
      res?.map((item: any) => ({
        ...item,
        DETAILS: [reqMemberInfo, ...(item.DETAILS || [])],
      })) || [];
    setMyApprList(updatedRes);
    const defaultAppr = updatedRes.reduce((prev, curr) => {
      const prevNum = Number(prev.H_TP_SEQ.replace(/\D/g, ''));
      const currNum = Number(curr.H_TP_SEQ.replace(/\D/g, ''));

      return currNum > prevNum ? curr : prev;
    });
    setApprovalInfo(defaultAppr);
    setApprovalLine(defaultAppr?.DETAILS);
  };

  return (
    <>
      {!Util.isEmpty(approvalLine) ? (
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
      )}
      {isVisibleApprovalModal && (
        <Modal
          transparent
          animationType='fade'
          onRequestClose={() => {
            setIsVisibleApprovalModal(false);
          }}
        >
          <View style={styles.overlay}>
            <LVModal
              title={'내 결재선을 선택하세요!'}
              buttonText={'선택'}
              contents={
                <LVApprList
                  ref={approvalLineRef}
                  myApprList={myApprList}
                  approvalInfo={approvalInfo}
                />
              }
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
                setApprovalInfo(selectedAppr);
                setApprovalLine([...selectedAppr?.DETAILS]);
                // 3. 모달 닫기
                setIsVisibleApprovalModal(false);
              }}
            />
          </View>
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
        </Modal>
      )}
    </>
  );
};
export default LVApprLineForm;

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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 82,
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
