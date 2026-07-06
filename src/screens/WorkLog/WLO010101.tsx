import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  Icon,
  LVChip,
  LVColors,
  LVLoadingIndicator,
  LVNoData,
  LVStyles,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { calendarTheme } from '@/src/theme/calendarTheme';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Calendar } from 'react-native-calendars';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action';
dayjs.locale('ko');

const WLO010101 = () => {
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);

  const today = dayjs().format('YYYY-MM-DD');
  const [selectedInfo, setSelectedInfo] = useState({ date: today });
  const [calendarKey, setCalendarKey] = useState(0);
  const [calDispList, setCalDispList] = useState({});
  const [calList, setCalList] = useState([]);
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [checkFilter, setCheckFilter] = useState([]);
  const [selectedCheckType, setSelectedCheckType] = useState('ALL');

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    const compareDate = selectedInfo.date.replace(/-/g, '');
    let tempList = list?.filter((item) => item.WA_LOG_DATE === compareDate);
    if (['S', 'E', 'O'].includes(selectedCheckType)) {
      tempList = tempList?.filter((item) => item.WA_TYPE === selectedCheckType);
    } else if (['ETC'].includes(selectedCheckType)) {
      tempList = tempList?.filter(
        (item) => !['S', 'E', 'O'].includes(item.WA_TYPE),
      );
    }
    setFilteredList(tempList);
  }, [selectedInfo, selectedCheckType]);

  const mount = async () => {
    setLoading(true);

    // 공통코드 가져오기
    let res = await COMAction.getCode('code', 'PC0001', { GCODE: 'WA_TYPE' });
    res = [...res, ...addCheckType];
    res = res
      .filter((e) => sort.includes(e?.HQCODE))
      .sort((a, b) => sort.indexOf(a.HQCODE) - sort.indexOf(b.HQCODE));
    setCheckFilter(res);
    // 캘린더 정보 가져오기
    await getInfoM();

    setLoading(false);
  };

  const getInfoM = async (yearMonthDayParam?: string) => {
    setLoading(true);

    // 오늘자로 초기 설정.
    let yearMonthDay = dayjs().format('YYYYMMDD');
    let yearMonth = dayjs().format('YYYYMM');
    if (yearMonthDayParam) {
      yearMonthDay = yearMonthDayParam;
      yearMonth = yearMonthDayParam.substring(0, 6);
    }
    const payload = {
      YEAR_MONTH: yearMonth,
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
    };
    const res = await Action.getInfoM(payload);
    setCalList(res?.HD);
    //  정상 및 공휴일 스타일 적용
    let obj = {};
    res?.HD?.filter((item) => ['CHECK'].includes(item.M_TYPE))
      .map((item) => item.M_DATE)
      .forEach((key: string, i: number) => (obj[key] = circleTheme));
    res?.HD?.filter((item) => ['HOLIDAY', 'WEEKEND'].includes(item.M_TYPE))
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) => (obj[key] = { ...obj[key], ...redTheme }),
      );
    setCalDispList(obj);
    // 리스트 가져오기 (선택된 날의 raw 데이터)
    setList(res?.DT);
    const compareDate = yearMonthDay || selectedInfo.date.replace(/-/g, '');
    let tempList = res?.DT.filter((item) => item.WA_LOG_DATE === compareDate);
    if (['S', 'E', 'O'].includes(selectedCheckType)) {
      tempList = tempList?.filter((item) => item.WA_TYPE === selectedCheckType);
    } else if (['ETC'].includes(selectedCheckType)) {
      tempList = tempList?.filter(
        (item) => !['S', 'E', 'O'].includes(item.WA_TYPE),
      );
    }
    setFilteredList(tempList);

    setLoading(false);
  };

  const movingToday = async () => {
    const date = dayjs().format('YYYY-MM-DD');
    setSelectedInfo({ date });
    setCalendarKey((prev) => prev + 1);
    getInfoM();
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      {/* 캘린더 */}
      <View style={{ marginVertical: 8 }}>
        <Calendar
          key={calendarKey}
          current={selectedInfo?.date}
          onDayPress={(day: any) => {
            const date = day.dateString;
            const dateInfo = calList.find((e) => date === e?.M_DATE);
            setSelectedInfo({ date, ...dateInfo });
          }}
          onMonthChange={(month: any) => {
            const date = month.dateString;
            setSelectedInfo({ date });
            const yearMonthDay = date.replace(/-/g, '');
            getInfoM(yearMonthDay);
          }}
          markingType='custom'
          markedDates={{
            ...calDispList,
            [selectedInfo?.date]: {
              selected: true,
              disableTouchEvent: true,
            },
          }}
          monthFormat='yyyy년 M월'
          renderArrow={(direction: any) => (
            <Icon
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              color='gray'
            />
          )}
          theme={calendarTheme}
        />
      </View>
      {/* (선택된 일자, 필터의) 리스트 조회 */}
      <View style={styles.workLogListSection}>
        <View style={LVStyles.row}>
          <Text
            style={{
              ...styles.text,
              color: ['WEEKEND', 'HOLIDAY'].includes(selectedInfo?.M_TYPE)
                ? '#FF585B'
                : '#1E2125',
            }}
          >
            {selectedInfo.date} ({dayjs(selectedInfo.date).format('ddd')}){' '}
            {selectedInfo?.HOLIDAY_NAME}
          </Text>
          <Text style={styles.text}>{filteredList?.length} 건</Text>
        </View>
        <View style={{ height: 8 }} />
        <Filter
          checkFilter={checkFilter}
          setSelectedCheckType={setSelectedCheckType}
          selectedCheckType={selectedCheckType}
        />
        <View style={{ height: 12 }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {!Util.isEmpty(filteredList) && (
            <View>
              {filteredList.map((e, i) => (
                <Form elem={e} key={i} />
              ))}
            </View>
          )}
          {Util.isEmpty(filteredList) && <LVNoData />}
        </ScrollView>
      </View>
      <View style={styles.iconWrap}>
        <Icon
          name='calendar-today-outline'
          color='#FFF'
          size={24}
          onPress={movingToday}
        />
      </View>
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default WLO010101;

const Form = (props: any) => {
  const { elem } = props;

  let bg1 = LVColors.primary;
  let bg2 = '#F0F6FA';
  if (elem.WA_TYPE === 'S') {
    bg1 = LVColors.primary;
    bg2 = '#F0F6FA';
  } else if (elem.WA_TYPE === 'E') {
    bg1 = '#003282';
    bg2 = '#EBEFF5';
  } else if (elem.WA_TYPE === 'O') {
    bg1 = '#26B6A4';
    bg2 = '#EEF9F8';
  } else {
    bg1 = '#FF5F25';
    bg2 = '#FFF2EE';
  }

  return (
    <View style={styles.entireCardView}>
      <View style={{ ...styles.cardSignature, backgroundColor: bg1 }} />
      {['S', 'E'].includes(elem?.WA_TYPE) && (
        // 출퇴근 카드 폼
        <View
          style={{
            ...styles.generalCardForm,
            backgroundColor: bg2,
          }}
        >
          <View style={{ width: '20%' }}>
            <Text style={styles.label}>시간</Text>
            <Text style={styles.value}>
              {Util.convertDateTime('', elem?.WA_LOG_TIME).trim() || '-'}
            </Text>
          </View>
          <View style={{ width: '20%' }}>
            <Text style={styles.label}>구분</Text>
            <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
          </View>
          <View style={{ width: '20%' }}>
            <Text style={styles.label}>반경여부</Text>
            <Text style={styles.value}>{elem?.WAT_STATUS_NM || '-'}</Text>
          </View>
          <View style={{ width: '40%' }}>
            <Text style={styles.label}>지점명</Text>
            <Text style={styles.value} numberOfLines={1}>
              {elem?.WAT_STATUS === 'Y' ? elem?.WAT_AREA_NAME : '-'}
            </Text>
          </View>
        </View>
      )}
      {['O'].includes(elem?.WA_TYPE) && (
        // 외근 카드 폼
        <View
          style={{
            ...styles.offsiteCardForm,
            backgroundColor: bg2,
          }}
        >
          <View style={styles.offsiteCardLine1}>
            <View style={{ width: '20%' }}>
              <Text style={styles.label}>시간</Text>
              <Text style={styles.value}>
                {Util.convertDateTime('', elem?.WA_LOG_TIME).trim() || '-'}
              </Text>
            </View>
            <View style={{ width: '20%' }}>
              <Text style={styles.label}>구분</Text>
              <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
            </View>
            <View style={{ width: '60%' }}>
              <Text style={styles.label}>지역</Text>
              <Text style={styles.value} numberOfLines={1}>
                {elem?.WAT_AREA_NAME || '-'}
              </Text>
            </View>
          </View>
          <View style={styles.offsiteCardLine2}>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>업체명 / 내용</Text>
              <Text style={styles.value} numberOfLines={1}>
                {elem?.OOO_REASON || '-'}
              </Text>
            </View>
          </View>
        </View>
      )}
      {!['S', 'E', 'O'].includes(elem?.WA_TYPE) && (
        // 그 외
        <View
          style={{
            ...styles.generalCardForm,
            backgroundColor: bg2,
          }}
        >
          <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
        </View>
      )}
    </View>
  );
};

const Filter = (props: any) => {
  const { checkFilter, setSelectedCheckType, selectedCheckType } = props;
  return (
    <View style={{ flexDirection: 'row' }}>
      {checkFilter.map((e) => (
        <TouchableOpacity
          onPress={() => {
            setSelectedCheckType(e?.HQCODE);
          }}
        >
          <LVChip
            category='type'
            content={e?.HQNAME}
            chipStyle={{
              paddingVertical: 6,
              borderColor:
                selectedCheckType === e?.HQCODE ? LVColors.primary : '#6A727B',
            }}
            textStyle={{
              color:
                selectedCheckType === e?.HQCODE ? LVColors.primary : '#6A727B',
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const sort = ['ALL', 'S', 'E', 'O', 'ETC'];

const addCheckType = [
  {
    HQCODE: 'ALL',
    HQNAME: '전체',
  },
  {
    HQCODE: 'ETC',
    HQNAME: '기타',
  },
];

const circleTheme = {
  customStyles: {
    container: { borderWidth: 1, borderColor: LVColors.primary },
  },
};
const redTheme = {
  customStyles: { text: { color: '#FF585B' } },
};

const styles = StyleSheet.create({
  workLogListSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  label: {
    color: '#454D58',
    fontWeight: '400',
    fontSize: 12,
    marginBottom: 8,
  },
  value: {
    color: '#454D58',
    fontWeight: '600',
    fontSize: 14,
  },
  iconOfarrow: {
    ...LVStyles.iconS,
    tintColor: '#454D58',
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: '#D5DCE5',
  },
  text: {
    color: '#1E2125',
    fontSize: 14,
    fontWeight: '800',
  },
  entireCardView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSignature: {
    width: 4,
    borderRadius: 4,
  },
  generalCardForm: {
    flex: 1,
    borderRadius: 4,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offsiteCardForm: { flex: 1, borderRadius: 4, padding: 16 },
  offsiteCardLine1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offsiteCardLine2: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8,
  },
  iconWrap: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#27A7FF',
  },
});
