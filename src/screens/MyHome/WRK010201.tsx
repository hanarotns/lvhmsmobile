import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  Icon,
  KeyboardAwareScrollView,
  LVButton,
  LVConfirmIndicator,
  LVDatePicker,
  LVLoadingIndicator,
  LVModal,
  LVStyles,
  SafeAreaView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { IndexPath, Input, Select, SelectItem } from '@ui-kitten/components';
import * as DocumentPicker from 'expo-document-picker';
import * as Action from './Action';

const WRK010201 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [isSearched, setIsSearched] = useState(false);
  const [isSelectedCompany, setIsSelectedCompany] = useState(false);
  const [isPostModal, setIsPostModal] = useState(false);
  const [isFileModal, setIsFileModal] = useState(false);
  const [companyList, setCompanyList] = useState([
    { code: 'C001', name: '하나로에이' },
    // {code: 'C002', name: '두번째회사'},
  ]);
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(
    new IndexPath(0),
  );
  const [selectedCompany, setSelectedCompany] = useState('하나로에이');
  const [postList, setPostList] = useState([]);
  const [selectedPostInfo, setSelectedPostInfo] = useState({});
  const [hopeDate, setHopeDate] = useState<Date>(new Date());
  const [workStartDate, setWorkStartDate] = useState<Date>(new Date());
  const [remark, setRemark] = useState('');
  const [applyForm, setApplyForm] = useState({});
  const [fileList, setFileList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    try {
      setLoading(true);
      setIsSearched(true);
      setIsSelectedCompany(false);
      setSelectedCompanyIndex(new IndexPath(0));
      setSelectedCompany('하나로에이');
      setHopeDate(new Date());
      setWorkStartDate(new Date());
      const res = await Action.getJobPostList();
      setPostList(res);
    } catch (e) {
      console.log('@@ WRK010201 mount error', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const date = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${date}`;
  };

  const onSelectCompany = (index) => {
    const selected = companyList[index.row];

    setSelectedCompanyIndex(index);
    setSelectedCompany(selected.name);

    setPostList((prev) => ({
      ...prev,
      companyName: selected.name,
    }));

    setApplyForm((prev) => ({
      ...prev,
      companyName: selected.name,
    }));

    setIsSelectedCompany(false);
  };

  const handleSearch = () => {
    setIsSearched(true);
  };

  const onPressSearch = () => {
    if (!selectedCompany) {
      return;
    }

    setPostList((prev) => ({
      ...prev,
      companyName: selectedCompany,
    }));

    setApplyForm((prev) => ({
      ...prev,
      companyName: selectedCompany,
    }));

    setIsSearched(true);
    setIsSelectedCompany(false);
  };

  const onPressSelectCompany = (p: object) => {
    setApplyForm(p);
    setIsSelectedCompany(true);
  };

  const onPressPostSelect = (p: object, i: number) => {
    setSelectedPostInfo({ ...p, key: i });
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
        await Action.deleteFile(
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

  const onPressSubmit = async () => {
    if (!applyForm?.POST_ID) {
      Util.toastMsg('공고를 선택하세요', 'error');
      return;
    }

    const pendingFiles = fileList.filter((f) => !f.uploaded);
    if (pendingFiles.length > 0) {
      Util.toastMsg('파일 업로드를 먼저 완료해주세요.', 'warning');
      return;
    }

    const result = await Action.save({
      ...applyForm,
      SUBMIT_YN: 'Y',
      MEMO: remark,
      PREF_START_DATE: hopeDate
        .toISOString()
        .substring(0, 10)
        .replace(/-/g, ''),
      AVAILABLE_START_DATE: workStartDate
        .toISOString()
        .substring(0, 10)
        .replace(/-/g, ''),
      ATTACHED_FILES: uploadedFiles.map((f) => ({
        FILE_MGT_CODE: f.FILE_MGT_CODE,
        FILE_NAME: f.fileName,
        YYMMDD: f.YYMMDD,
      })),
    });
    if (result?.TYPE === 1) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        movingScreen.goBack();
      }, 1200);
    }
  };

  const onPressCancel = () => {
    movingScreen.goBack();
  };

  const handleSavePost = () => {
    (setApplyForm(postList[selectedPostInfo?.key]), setIsPostModal(false));
  };

  const handleSaveFile = async () => {
    try {
      setUploading(true);

      const refNo = applyForm?.REF_NO || generateRefNo();
      const pendingFiles = fileList.filter((f) => !f.uploaded);

      if (pendingFiles.length === 0) {
        Util.toastMsg('업로드할 파일이 없습니다.', 'info');
        setIsFileModal(false);
        return;
      }

      const companyCode = sessionInfo?.COMPANY_CODE || 'HTNS';
      const results = await Promise.all(
        pendingFiles.map(async (file) => {
          try {
            const uploaded = await Action.uploadFile(file, refNo, companyCode);
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
      setIsFileModal(false);
    } catch (error) {
      console.error('파일 업로드 에러:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderSearchRow = () => {
    return (
      <View style={styles.conditionWrap}>
        <View style={styles.conditionRow}>
          <View style={styles.inlineFieldRow}>
            <Text style={styles.inlineLabel}>법인</Text>

            <View style={styles.selectWrap}>
              <Select
                selectedIndex={selectedCompanyIndex}
                value={selectedCompany}
                onSelect={onSelectCompany}
                style={styles.select}
                placeholder='법인 선택'
              >
                {companyList.map((item) => (
                  <SelectItem key={item.code} title={item.name} />
                ))}
              </Select>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchIconButton}
          >
            <Icon name='file-search-outline' color='#27A7FF' size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSearchResult = (p: object, i: number) => {
    if (!isSearched || isSelectedCompany) {
      return null;
    }

    return (
      <TouchableOpacity
        style={i === selectedPostInfo?.key ? styles.selectedCard : styles.card}
        onPress={() => {
          onPressPostSelect(p, i);
        }}
      >
        <View style={styles.infoRow}>
          <View style={[styles.infoCol, { justifyContent: 'center' }]}>
            <Text style={styles.infoTitleText}>{p?.POST_NAME}</Text>
          </View>
        </View>
        <View style={styles.infoCol}>
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '600',
              },
            ]}
          >
            {p?.POST_SUMMARY}
          </Text>
        </View>
        <View style={{ height: 12 }} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel1}>주요업무</Text>
          <Text style={{}}>{p?.JOBS}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel1}>자격요건</Text>
          <Text style={styles.infoValueText}>{p?.QUALIFICATIONS}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel1}>근무조건</Text>
          <Text style={styles.infoValueText}>{p?.CONDITIONS || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel1}>복지 및 혜택</Text>
          <Text style={styles.infoValueText}>{p?.BENEFITS || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel1}>유의사항</Text>
          <Text style={styles.infoValueText}>{p?.NOTICE || '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderApplyForm = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.blockTitle}>지원정보</Text>
        <View
          style={[
            styles.infoRow,
            { alignItems: 'flex-end', justifyContent: 'space-between' },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel1}>공고명</Text>
            <Text style={{ fontWeight: '700', fontSize: 16 }}>
              {applyForm?.POST_NAME || '-'}
            </Text>
          </View>
          <LVButton
            title='선택'
            onPress={() => {
              setIsPostModal(true);
            }}
            buttonStyle={styles.smallOutlineButton}
            textStyle={styles.smallOutlineButtonText}
          />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel2}>근무희망일</Text>
            <LVDatePicker
              date={hopeDate}
              setDate={setHopeDate}
              isDisableTime={true}
            />
          </View>

          <View style={[styles.infoCol, styles.infoColLast]}>
            <Text style={styles.infoLabel2}>근무시작가능일</Text>
            <LVDatePicker
              date={workStartDate}
              setDate={setWorkStartDate}
              isDisableTime={true}
            />
          </View>
        </View>

        <View style={styles.infoRowNoMargin}>
          <View style={styles.infoColFull}>
            <Text style={styles.infoLabel2}>학력</Text>
            <Input
              value={applyForm?.EDU}
              placeholder='학력을 입력해주세요.'
              multiline={true}
              textStyle={styles.inputText}
              style={styles.input}
              onChangeText={(text) => setApplyForm({ ...applyForm, EDU: text })}
            />
          </View>
        </View>
        <View style={styles.infoRowNoMargin}>
          <View style={styles.infoColFull}>
            <Text style={styles.infoLabel2}>경력</Text>
            <Input
              value={applyForm?.CAREER}
              placeholder='경력을 입력해주세요.'
              multiline={true}
              textStyle={styles.inputText}
              style={styles.input}
              onChangeText={(text) =>
                setApplyForm({ ...applyForm, CAREER: text })
              }
            />
          </View>
        </View>
        <View style={styles.infoRowNoMargin}>
          <View style={styles.infoColFull}>
            <Text style={styles.infoLabel2}>스킬</Text>
            <Input
              value={applyForm?.SKILLS}
              placeholder='스킬을 입력해주세요.'
              multiline={true}
              textStyle={styles.inputText}
              style={styles.input}
              onChangeText={(text) =>
                setApplyForm({ ...applyForm, SKILLS: text })
              }
            />
          </View>
        </View>
        <View style={styles.infoRowNoMargin}>
          <View style={styles.infoColFull}>
            <Text style={styles.infoLabel2}>비고</Text>
            <Input
              value={applyForm?.MEMO}
              placeholder='비고를 입력해주세요.'
              multiline={true}
              textStyle={styles.remarkInputText}
              style={styles.input}
              onChangeText={(text) =>
                setApplyForm({ ...applyForm, MEMO: text })
              }
            />
          </View>
        </View>
        <View style={{ height: 12 }} />
        <View style={styles.infoRowNoMargin}>
          <View style={styles.infoCol}>
            <View
              style={[
                styles.infoRow,
                { alignItems: 'flex-end', justifyContent: 'space-between' },
              ]}
            >
              <Text style={styles.infoLabel2}>첨부파일</Text>
              <LVButton
                title='추가'
                onPress={() => {
                  setIsFileModal(true);
                }}
                buttonStyle={styles.smallOutlineButton}
                textStyle={styles.smallOutlineButtonText}
              />
            </View>
            {fileList?.map((elem, i) => (
              <View
                style={[styles.infoRow, { alignItems: 'center' }]}
                key={elem.seq}
              >
                <View style={styles.infoValueBox}>
                  <Text style={[styles.infoValueText]}>{elem?.seq}</Text>
                </View>
                <View style={{ width: 8 }} />
                <View style={[styles.infoValueBox, { flex: 1 }]}>
                  <Text style={styles.infoValueText}>
                    {elem?.fileName} ({elem?.fileSize}){elem?.uploaded && ' ✅'}
                  </Text>
                </View>
                <View style={{ width: 8 }} />
                <TouchableOpacity
                  onPress={() => handleDeleteFile(elem.seq)}
                  style={styles.deleteIconWrap}
                >
                  <Icon
                    name='trash-can-outline'
                    color='#FFFFFF'
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          keyboardShouldPersistTaps='handled'
          enableOnAndroid
          extraScrollHeight={20}
          showsVerticalScrollIndicator={false}
        >
          {renderApplyForm()}
        </KeyboardAwareScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title='취소'
            onPress={onPressCancel}
            buttonStyle={LVStyles.cancelButton}
            textStyle={LVStyles.cancelButtonText}
          />
          <LVButton
            title='지원'
            onPress={onPressSubmit}
            buttonStyle={{ flex: 1 }}
          />
        </View>
      </View>
      {isPostModal && (
        <LVModal
          title='공고 선택'
          contents={
            <>
              {renderSearchRow()}
              {isSearched && !Util.isEmpty(postList) ? (
                <View style={{ flex: 1 }}>
                  {postList?.map((e, i) => renderSearchResult(e, i))}
                </View>
              ) : (
                <></>
              )}
            </>
          }
          onVisible={setIsPostModal}
          onOk={handleSavePost}
        />
      )}
      {isFileModal && (
        <LVModal
          title='첨부파일 추가'
          contents={
            <>
              <LVButton
                title='파일 선택'
                onPress={onPressFileAdd}
                buttonStyle={styles.smallOutlineButton}
                textStyle={styles.smallOutlineButtonText}
              />
              <View style={{ height: 12 }} />
              {fileList?.map((elem, i) => (
                <View
                  style={[styles.infoRow, { alignItems: 'center' }]}
                  key={elem.seq}
                >
                  <View style={styles.infoValueBox}>
                    <Text style={[styles.infoValueText]}>{elem?.seq}</Text>
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
          }
          onVisible={setIsFileModal}
          onOk={handleSaveFile}
          okDisabled={uploading}
        />
      )}
      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </SafeAreaView>
  );
};

export default WRK010201;

const COLORS = {
  screen: '#F6F7FB',
  white: '#FFFFFF',
  border: '#E5E9F0',
  text: '#222B45',
  subText: '#8F9BB3',
};

const styles = StyleSheet.create({
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
  datepicker: {
    height: 48,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 8,
    justifyContent: 'center',
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
  bottomMainButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
  bottomMainButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSubButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSubButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#27A7FF',
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
});
