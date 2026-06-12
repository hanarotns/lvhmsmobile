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
  LVButton,
  LVConfirmIndicator,
  LVLoadingIndicator,
  LVModal,
  LVNoData,
  LVSelectBox,
  LVStyles,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@ui-kitten/components';
import 'dayjs/locale/ko';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';

const PAL010201 = () => {
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [approvalLine, setApprovalLine] = useState({});
  const [approvalLineDt, setApprovalLineDt] = useState([]);
  const [apprRoleList, setApprRoleList] = useState([]);
  const [isVisibleApprovalModal, setIsVisibleApprovalModal] = useState(false);

  const approvalLineRef = useRef<any>(null);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    // 결재 역할 조회
    const resOfApprRole = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'AP_TYPE',
    });
    const res = resOfApprRole?.filter((e) => ['AP', 'RE'].includes(e.HQCODE));
    setApprRoleList(res);
    setLoading(false);
  };

  /**
   * 비즈니스 로직 확인용
   */
  const checkLogic = async () => {
    if (Util.isEmpty(approvalLine.AP_NAME)) {
      Util.toastMsg('결재선 이름을 입력하세요', 'info');
      return false;
    }
    if (Util.isEmpty(approvalLineDt)) {
      Util.toastMsg('결재자를 지정하세요', 'info');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    const isCheck = await checkLogic();
    if (!isCheck) {
      return;
    }
    const approvalLineDtAdd = approvalLineDt?.map((e, i) => ({
      ...e,
      LINE_NO: i + 1,
    }));
    setLoading(true);
    const result = await Action.saveMobile(
      { ...approvalLine, ...empInfo },
      approvalLineDtAdd,
    );
    setLoading(false);
    if (result.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const handleChangeApprovalType = (index: number, apType: string) => {
    setApprovalLineDt((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, AP_TYPE: apType } : item,
      ),
    );
  };

  const handleDeleteApprovalLine = (index: number) => {
    setApprovalLineDt((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const ContentsOfApproval = forwardRef((props: any, ref) => {
    const [name, setName] = useState('');
    const [userList, setUserList] = useState([]);
    const [selectedAppr, setSelectedAppr] = useState({});
    useImperativeHandle(ref, () => ({
      getSelectedValues: () => ({
        selectedAppr,
      }),
    }));

    const handleSearch = async () => {
      const res = await COMAction.getPopup('PP0004', {
        EMP_NAME: name,
        COMPANY_CODE: empInfo?.COMPANY_CODE,
        USER_LANG: sessionInfo?.USER_LANG,
      });
      setUserList(res);
    };

    return (
      <View>
        <View style={[LVStyles.row]}>
          <Input
            placeholder='이름으로 검색하세요.'
            placeholderTextColor='#939DAA'
            value={name}
            onChangeText={(value) => {
              setName(value);
            }}
            style={{ backgroundColor: '#FFF', flex: 1 }}
            textStyle={{ color: '#373747', fontSize: 14 }}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchIconButton}
          >
            <Icon name='file-search-outline' color='#27A7FF' />
          </TouchableOpacity>
        </View>
        <View style={styles.approvalView}>
          {!Util.isEmpty(userList) &&
            userList?.map((e, i) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedAppr({
                    ...e,
                    index: i,
                    COMPANY_CODE: empInfo?.COMPANY_CODE,
                    H_COMPANY_CODE: empInfo?.COMPANY_CODE,
                    AP_DEPT_CODE: e?.DEPT_CODE,
                    AP_DEPT_NAME: e?.DEPT_NAME,
                    AP_EMP_ID: e?.EMP_ID,
                    AP_EMP_NAME: e?.EMP_NAME,
                    AP_TYPE: e?.AP_TYPE || 'AP',
                  });
                }}
                style={{ marginBottom: 8 }}
              >
                <View
                  style={{
                    ...styles.userListView,
                    backgroundColor:
                      selectedAppr?.index === i ? '#27A7FF17' : 'transparent',
                    borderColor:
                      selectedAppr?.index === i ? '#27A7FF' : 'lightgray',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{`${e?.DEPT_NAME}`}</Text>
                  <Text
                    style={styles.empText}
                  >{`${e?.EMP_NAME} ${e?.POSITION_NAME}`}</Text>
                </View>
              </TouchableOpacity>
            ))}
          {Util.isEmpty(userList) && <LVNoData />}
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={styles.approvalLineLabel}>결재선</Text>
          <Input
            placeholder='결재선 이름을 입력하세요.'
            placeholderTextColor='#939DAA'
            value={approvalLine.AP_NAME}
            onChangeText={(value) => {
              setApprovalLine({
                ...approvalLine,
                AP_NAME: value,
              });
            }}
            size='large'
            style={{ backgroundColor: '#FFF', marginTop: 8 }}
            textStyle={{ color: '#373747', fontSize: 14 }}
          />
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Detail */}
          <View style={{ padding: 16 }}>
            <View style={[LVStyles.row, { paddingRight: 16 }]}>
              <Text style={styles.approvalLineLabel}>결재자 지정</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsVisibleApprovalModal(true);
                }}
              >
                <Icon name='account-plus' color='#373747' />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 8, flex: 1 }}>
              {approvalLineDt.map((e, i) => (
                <PersonalForm
                  elem={{ ...e, index: i + 1 }}
                  apprRoleList={apprRoleList}
                  onSelect={(value) => handleChangeApprovalType(i, value)}
                  onDelete={() => handleDeleteApprovalLine(i)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'저장'}
            onPress={handleSave}
            buttonStyle={{ flex: 1 }}
          />
        </View>
      </View>
      {isVisibleApprovalModal && (
        <LVModal
          title={'결재자를 선택하세요'}
          buttonText={'선택'}
          contents={<ContentsOfApproval ref={approvalLineRef} />}
          onVisible={setIsVisibleApprovalModal}
          onOk={() => {
            // 1. 자식에서 선택값 가져오기
            const { selectedAppr } =
              approvalLineRef.current.getSelectedValues();
            if (selectedAppr?.EMP_ID === empInfo?.EMP_ID) {
              Util.toastMsg('나를 결재자로 추가할 수 없습니다.', 'info');
              return;
            }
            if (Util.isEmpty(selectedAppr)) {
              Util.toastMsg('선택된 결재자가 없습니다.', 'info');
              return;
            }
            // 2. approvalLineDt에 추가
            setApprovalLineDt((prev) => [...prev, selectedAppr]);
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
export default PAL010201;

const PersonalForm = (props: any) => {
  const { elem, apprRoleList, onSelect, onDelete } = props;
  return (
    <View style={styles.personalFormView}>
      <Text style={styles.indexText}>{elem?.index}</Text>
      <View style={{ flex: 0.5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.empNameText}>{elem?.EMP_NAME}</Text>
          <Text style={styles.empPositionText}>{elem?.POSITION_NAME}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Text style={{ color: '#6A727B' }}>{elem?.DEPT_NAME}</Text>
        </View>
      </View>
      <View style={styles.personalFormSubView}>
        <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
          <LVSelectBox
            value={'AP'} //@@ 확인 필요
            onChange={(value: string) => {
              onSelect(value);
            }}
            data={apprRoleList}
            displayField={'HQNAME'}
            valueField={'HQCODE'}
          />
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.iconWrap}>
        <Icon name='close' color='gray' />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  approvalView: {
    display: 'flex',
    marginTop: 10,
  },
  userListView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  empText: {
    fontSize: 16,
    fontWeight: '600',
  },
  approvalLineLabel: {
    color: '#6A727B',
    fontWeight: '600',
  },
  personalFormView: {
    display: 'flex',
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 64,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F0F2F6',
    flex: 1,
  },
  indexText: {
    flex: 0.1,
    fontSize: 16,
    color: '#6A727B',
  },
  empNameText: {
    fontWeight: '600',
    fontSize: 16,
  },
  empPositionText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  personalFormSubView: {
    display: 'flex',
    flexDirection: 'row',
    flex: 0.4,
  },
  iconWrap: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
