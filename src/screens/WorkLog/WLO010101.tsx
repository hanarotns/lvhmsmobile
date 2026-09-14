import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  Icon,
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

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    const compareDate = selectedInfo.date.replace(/-/g, '');
    let tempList = list?.filter((item) => item.WA_LOG_DATE === compareDate);
    setFilteredList(tempList);
  }, [selectedInfo]);

  const mount = async () => {
    setLoading(true);

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
    const formattedDate = Util.convertDateTime(yearMonthDay);
    handleChangeDateInfo(formattedDate, res?.HD);
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
    res?.HD?.filter(
      (item) =>
        ['PLAN'].includes(item.M_TYPE) &&
        ['N02'].includes(item.SHIFT_WORK_CODE),
    )
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) => (obj[key] = { ...obj[key], shift: 'day' }),
      );
    res?.HD?.filter(
      (item) =>
        ['PLAN'].includes(item.M_TYPE) &&
        ['N03'].includes(item.SHIFT_WORK_CODE),
    )
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) =>
          (obj[key] = { ...obj[key], shift: 'night' }),
      );
    res?.HD?.filter(
      (item) =>
        ['PLAN'].includes(item.M_TYPE) &&
        !['HD', 'N02', 'N03'].includes(item.SHIFT_WORK_CODE),
    )
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) => (obj[key] = { ...obj[key], shift: 'diff' }),
      );
    res?.HD?.filter((item) => ['OVERTIME'].includes(item.M_TYPE))
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) =>
          (obj[key] = { ...obj[key], overtime: 'ot' }),
      );
    setCalDispList(obj);
    // 리스트 가져오기 (선택된 날의 raw 데이터)
    setList(res?.DT);
    const compareDate = yearMonthDay || selectedInfo.date.replace(/-/g, '');
    let tempList = res?.DT.filter((item) => item.WA_LOG_DATE === compareDate);
    setFilteredList(tempList);

    setLoading(false);
  };

  const movingToday = async () => {
    await getInfoM();
    setCalendarKey((prev) => prev + 1);
  };

  const handleChangeDateInfo = async (param1: string, param2?: any) => {
    let list = calList;
    if (!Util.isEmpty(param2)) {
      list = param2;
    }
    const weekendInfo = list?.find(
      (e) => param1 === e?.M_DATE && e?.M_TYPE === 'WEEKEND',
    );
    const holidayInfo = list?.find(
      (e) => param1 === e?.M_DATE && e?.M_TYPE === 'HOLIDAY',
    );
    let planInfo = list?.find(
      (e) => param1 === e?.M_DATE && e?.M_TYPE === 'PLAN',
    );
    let workInfo = list?.find(
      (e) => param1 === e?.M_DATE && e?.M_TYPE === 'WORK',
    );
    if (planInfo) {
      planInfo = {
        SHIFT_WORK_CODE: planInfo?.SHIFT_WORK_CODE,
        SHIFT_ON_TIME: planInfo?.SHIFT_ON_TIME,
        SHIFT_OFF_TIME: planInfo?.SHIFT_OFF_TIME,
      };
    } else {
      planInfo = {
        SHIFT_WORK_CODE: workInfo?.SHIFT_WORK_CODE,
        SHIFT_ON_TIME: workInfo?.SHIFT_ON_TIME,
        SHIFT_OFF_TIME: workInfo?.SHIFT_OFF_TIME,
      };
    }
    setSelectedInfo({
      date: param1,
      ...weekendInfo,
      ...holidayInfo,
      ...planInfo,
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      {/* 캘린더 */}
      <View style={{ marginVertical: 8 }}>
        <Calendar
          key={calendarKey}
          current={selectedInfo?.date}
          onMonthChange={(month: any) => {
            const date = month.dateString;
            const yearMonthDay = date.replace(/-/g, '');
            getInfoM(yearMonthDay);
          }}
          markingType='custom'
          markedDates={{
            ...calDispList,
            [selectedInfo?.date]: {
              ...calDispList?.[selectedInfo?.date],
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
          dayComponent={({ date, state, marking }) => {
            const customStyles = marking?.customStyles;

            if (!date) return null;
            const currentMonth = selectedInfo?.date?.substring(0, 7); // 현재 캘린더에 표시 중인 월
            const dateMonth = date.dateString.substring(0, 7); // 해당 날짜의 월
            const isOtherMonth = currentMonth !== dateMonth;

            return (
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  disabled={isOtherMonth}
                  onPress={() => {
                    handleChangeDateInfo(date?.dateString);
                  }}
                  style={[
                    styles.dayView,
                    customStyles?.container, // 기존 customStyles 적용
                    selectedInfo?.date === date?.dateString && {
                      backgroundColor: '#27A7FF88',
                    },
                  ]}
                >
                  {marking?.overtime == 'ot' && (
                    <View style={styles.clockView}>
                      <Icon name='clock-outline' size={12} color='#27A7FF' />
                    </View>
                  )}
                  <Text
                    style={[
                      {
                        color: state === 'disabled' ? '#ccc' : '#373747',
                        ...customStyles?.text, // 기존 customStyles 적용
                      },
                      selectedInfo?.date === date?.dateString && {
                        color: '#FFF',
                      },
                    ]}
                  >
                    {date.day}
                  </Text>
                </TouchableOpacity>
                {marking?.shift && (
                  <>
                    <View
                      style={{
                        ...styles.bar,
                        backgroundColor:
                          marking?.shift == 'day' ? '#27A7FF' : 'lightgray',
                      }}
                    />
                    <View
                      style={{
                        ...styles.bar,
                        backgroundColor:
                          marking?.shift == 'night' ? '#27A7FF' : 'lightgray',
                      }}
                    />
                  </>
                )}
              </View>
            );
          }}
        />
      </View>
      {/* (선택된 일자, 필터의) 리스트 조회 */}
      <View style={styles.workLogListSection}>
        <View style={LVStyles.row}>
          <View style={{ width: '60%' }}>
            <Text
              style={{
                ...styles.text,
                color: ['WEEKEND', 'HOLIDAY'].includes(selectedInfo?.M_TYPE)
                  ? '#FF585B'
                  : '#1E2125',
              }}
            >
              {selectedInfo.date.substring(5)} (
              {dayjs(selectedInfo.date).format('ddd')}){' '}
              {selectedInfo?.HOLIDAY_NAME}
            </Text>
          </View>

          <View style={styles.regularTimeView}>
            <Text style={styles.regularTime}>
              {selectedInfo?.SHIFT_ON_TIME
                ? `${Util.convertDateTime('', selectedInfo?.SHIFT_ON_TIME)}~${Util.convertDateTime('', selectedInfo?.SHIFT_OFF_TIME)}`
                : ''}
            </Text>
          </View>
        </View>
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
      <TouchableOpacity style={styles.todayButton} onPress={movingToday}>
        <Text style={{ color: '#FFF' }}>오늘</Text>
      </TouchableOpacity>
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
          <View style={{ width: '20%' }}>
            <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
          </View>
          <View style={{ width: '80%' }}>
            <Text style={styles.value}>{elem?.OOO_REASON || '-'}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

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
    ...LVStyles.body,
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
  text: {
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
  offsiteCardForm: {
    flex: 1,
    borderRadius: 4,
    padding: 16,
  },
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
  todayButton: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#27A7FF88',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  clockView: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  dayView: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regularTimeView: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  regularTime: {
    color: '#888',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
