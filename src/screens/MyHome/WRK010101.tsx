import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import * as icon from '@/src/assets/images';
import {
  Icon,
  Layout,
  LVButton,
  LVChip,
  LVColors,
  LVHeaderInfo,
  LVLoadingIndicator,
  LVNoData,
  LVStyles,
  SafeAreaView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import * as Action from './Action';

const WRK010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();

  const [loading, setLoading] = useState(true);

  const [statusList, setStatusList] = useState([
    { code: 'ALL', name: '전체' },
    { code: 'R', name: '대기' },
    { code: 'Y', name: '승인' },
    { code: 'N', name: '반려' },
  ]);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(
    new IndexPath(0),
  );
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [isSearched, setIsSearched] = useState(false);
  const [applyList, setApplyList] = useState([]);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    try {
      setLoading(true);
      setIsSearched(true);
      const res = await Action.getJobApplyList();
      setApplyList(res);
    } catch (e) {
      console.log('@@ WRK010101 mount error', e);
    } finally {
      setLoading(false);
    }
  };

  const onSelectStatus = (index) => {
    setSelectedStatusIndex(index);
    setSelectedStatus(statusList[index.row].name);
  };

  const handleSearch = () => {
    setIsSearched(true);
  };

  const onPressApply = () => {
    movingScreen.navigate('WRK010201');
  };

  const onPressDelete = async () => {};

  const onPressEdit = async () => {};

  const renderHeader = () => (
    <Layout style={styles.renderHeaderLayout}>
      <Image source={icon.ico_logo_htns} style={styles.renderHeaderImage} />
      <LVHeaderInfo />
      <TouchableOpacity
        onPress={() => {
          movingScreen.navigate('ETC010101');
        }}
      >
        <Image source={icon.ico_account} style={styles.renderHeaderSubImage} />
      </TouchableOpacity>
    </Layout>
  );

  const renderDesc = () => {
    return (
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>근무현황</Text>
        <Text style={styles.headerDesc}>
          근무 중인 사업장과 지원 상태를 확인할 수 있습니다.
        </Text>
        {renderConditionRow()}
      </View>
    );
  };

  const renderConditionRow = () => {
    return (
      <View style={styles.conditionWrap}>
        <View style={styles.conditionRow}>
          <View style={styles.inlineFieldRow}>
            <Text style={styles.inlineLabel}>상태</Text>

            <View style={styles.selectWrap}>
              <Select
                selectedIndex={selectedStatusIndex}
                value={selectedStatus}
                onSelect={onSelectStatus}
                style={styles.select}
                placeholder='상태 선택'
              >
                {statusList.map((item) => (
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

  const renderApplyForm = (p: object, i: number) => {
    return (
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <LVChip
            category='confirmStatus'
            title={p?.CONFIRM_STATUS_NM}
            code={p?.CONFIRM_STATUS}
          />
          <View style={{ width: 12 }} />
          <View style={styles.infoCol}>
            <Text style={styles.infoTitleText}>{p?.POST_NAME}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>근무희망일</Text>
            <Text style={styles.infoValueText}>
              {Util.convertDateTime(p?.PREF_START_DATE)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>근무시작가능일</Text>
            <Text style={styles.infoValueText}>
              {Util.convertDateTime(p?.AVAILABLE_START_DATE)}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>메모</Text>
            <Text style={styles.infoValueText}>{p?.MEMO}</Text>
          </View>
        </View>
        <View
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}
        >
          <LVButton
            title='수정하기'
            onPress={onPressEdit}
            buttonStyle={styles.button}
            textStyle={{ color: '#27A7FF' }}
          />
          <View style={{ width: 12 }} />
          <LVButton
            title='삭제하기'
            onPress={onPressDelete}
            buttonStyle={[styles.button, { borderColor: 'gray' }]}
            textStyle={{ color: 'gray' }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={LVStyles.safeAreaView}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          <View style={{ height: 20 }} />
          {renderDesc()}
          <Text style={styles.blockTitle}>지원내역</Text>
          {isSearched && !Util.isEmpty(applyList) ? (
            <View style={{ flex: 1 }}>
              {applyList?.map((e, i) => renderApplyForm(e, i))}
            </View>
          ) : (
            <View style={{ height: '100%' }}>
              <LVNoData />
            </View>
          )}
        </ScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title='입사지원으로 이동'
            onPress={onPressApply}
            buttonStyle={styles.fullApplyButton}
            textStyle={styles.fullApplyButtonText}
          />
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default WRK010101;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF',
    borderColor: '#27A7FF',
    borderWidth: 1,
    padding: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: LVColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: LVColors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LVColors.text,
  },
  headerDesc: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: LVColors.subText,
  },
  conditionWrap: {
    marginTop: 14,
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
    width: 42,
    fontSize: 14,
    fontWeight: '700',
    color: LVColors.subText,
    marginRight: 10,
  },
  selectWrap: {
    flex: 1,
  },
  select: {
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
  fullApplyButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
  },
  fullApplyButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: LVColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: LVColors.border,
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LVColors.text,
    marginBottom: 14,
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
  infoLabel: {
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
    fontSize: 16,
    fontWeight: '600',
    color: LVColors.text,
  },
  bottomButton: {
    padding: 32,
    position: 'absolute',
    width: '100%',
    bottom: 0,
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
  renderHeaderLayout: {
    ...LVStyles.row,
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  renderHeaderImage: {
    marginLeft: 32,
    marginTop: 8,
    width: 75,
    height: 16,
  },
  renderHeaderSubImage: {
    marginTop: 8,
    marginRight: 24,
    ...LVStyles.iconS,
  },
});
