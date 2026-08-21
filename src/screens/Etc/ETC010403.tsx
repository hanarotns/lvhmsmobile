import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useRefreshStore } from '@/src/stores/refreshStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  Icon,
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
import 'dayjs/locale/ko';
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
  const [isVisibleAttachModal, setIsVisibleAttachModal] = useState(false);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);
    setDt(route?.params);

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

  /** 미리보기 */
  const handlePreView = async () => {
    setIsVisibleAttachModal(true);
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
