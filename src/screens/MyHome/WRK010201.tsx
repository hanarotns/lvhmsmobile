import {
  LVButton,
  LVConfirmIndicator,
  LVDatePicker,
  LVLoadingIndicator,
  LVModal,
  Text,
} from '@/src/components';
import LVColors from '@/src/components/LVColors';
import LVStyles from '@/src/components/LVStyles';
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Icon,
  IndexPath,
  Input,
  Select,
  SelectItem,
} from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';

import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Action from './Action'; // API통신

const WRK010201 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();

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

  const [fileList, setFileList] = useState([
    {
      seq: '01',
      fileName: '이력서',
      fileSize: '256KB',
    },
  ]);

  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);

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

  const onPressFileAdd = () => {};

  const onPressSubmit = async () => {
    if (!applyForm?.POST_ID) {
      Util.toastMsg('공고를 선택하세요', 'error');
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

  const handleSaveFile = () => {};

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
            style={{
              marginLeft: 8,
              flex: 1,
              aspectRatio: 1,
              borderWidth: 2,
              borderColor: '#27A7FF',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name={'search-outline'}
              fill={'#27A7FF'}
              style={[LVStyles.iconS]}
            />
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
              <View style={[styles.infoRow, { alignItems: 'center' }]}>
                <View style={styles.infoValueBox}>
                  <Text style={[styles.infoValueText]}>{elem?.seq}</Text>
                </View>
                <View style={{ width: 8 }} />
                <View style={[styles.infoValueBox, { flex: 1 }]}>
                  <Text style={styles.infoValueText}>
                    {elem?.fileName} ({elem?.fileSize})
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderApplyForm()}
        </ScrollView>

        <View style={[LVStyles.row, styles.bottomButton]}>
          <View style={styles.bottomRightWrap}>
            <LVButton
              title='지원하기'
              onPress={onPressSubmit}
              buttonStyle={styles.bottomMainButton}
              textStyle={styles.bottomMainButtonText}
            />

            <LVButton
              title='취소하기'
              onPress={onPressCancel}
              buttonStyle={styles.bottomSubButton}
              textStyle={styles.bottomSubButtonText}
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
                {fileList?.map((elem, i) => (
                  <View style={[styles.infoRow, { alignItems: 'center' }]}>
                    <View style={styles.infoValueBox}>
                      <Text style={[styles.infoValueText]}>{elem?.seq}</Text>
                    </View>
                    <View style={{ width: 8 }} />
                    <View style={[styles.infoValueBox, { flex: 1 }]}>
                      <Text style={styles.infoValueText}>
                        {elem?.fileName} ({elem?.fileSize})
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            }
            onVisible={setIsFileModal}
            onOk={handleSaveFile}
          />
        )}
      </View>

      {loading && <LVLoadingIndicator />}
      {confirming && <LVConfirmIndicator />}
    </View>
  );
};
export default WRK010201;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LVColors.screen,
  },
  safeArea: {
    flex: 1,
    backgroundColor: LVColors.screen,
  },
  scrollView: {
    flex: 1,
    backgroundColor: LVColors.screen,
  },
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
    color: LVColors.subText,
    marginRight: 10,
  },
  selectWrap: {
    flex: 1,
  },
  select: {
    backgroundColor: LVColors.white,
    borderColor: LVColors.border,
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
    backgroundColor: LVColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: LVColors.border,
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
    color: LVColors.text,
    marginBottom: 14,
  },
  blockTitleNoMargin: {
    fontSize: 16,
    fontWeight: '700',
    color: LVColors.text,
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
    color: LVColors.subText,
    marginBottom: 6,
    width: '30%',
  },
  infoLabel2: {
    fontSize: 13,
    fontWeight: '700',
    color: LVColors.subText,
    marginBottom: 6,
  },
  infoValueBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: LVColors.border,
    borderRadius: 8,
    backgroundColor: LVColors.white,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  infoTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: LVColors.text,
  },
  infoValueText: {
    fontSize: 14,
    color: LVColors.text,
  },
  datepicker: {
    height: 48,
    backgroundColor: LVColors.white,
    borderColor: LVColors.border,
    borderRadius: 8,
    justifyContent: 'center',
  },
  input: {
    minHeight: 58,
    backgroundColor: LVColors.white,
    borderColor: LVColors.border,
    borderRadius: 12,
  },
  inputText: {
    minHeight: 28,
    textAlignVertical: 'top',
  },
  remarkInput: {
    minHeight: 92,
    backgroundColor: LVColors.white,
    borderColor: LVColors.border,
    borderRadius: 12,
  },
  remarkInputText: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    position: 'absolute',
    width: '100%',
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LVColors.screen,
  },
  bottomRightWrap: {
    flexDirection: 'row',
    width: '100%',
  },
  bottomMainButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    marginRight: 8,
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
});
