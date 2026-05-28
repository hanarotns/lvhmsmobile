import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  Icon,
  LVChip,
  LVLoadingIndicator,
  LVNoData,
  LVStyles,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import { Util } from '@/src/lib';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Calendar } from 'react-native-calendars';
import * as COMAction from '../Common/Action'; // API통신 (공통)
import * as Action from './Action'; // API통신

dayjs.locale('ko');

const WLO010101 = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);

  const [calDispList, setCalDispList] = useState({});
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState({
    date: dayjs().format('YYYY-MM-DD'),
  });
  const [checkFilter, setCheckFilter] = useState([]);
  const [selectedCheckType, setSelectedCheckType] = useState('A');
  const [offsiteInfo, setOffsiteInfo] = useState({});
  const [isVisibleEdit, setIsVisibleEdit] = useState(false);
  const [isVisibleDelete, setIsVisibleDelete] = useState(false);
  const [isVisibleOff, setIsVisibleOff] = useState(false);

  useEffect(() => {
    if (isFocused) {
      const initYearMonth = selectedInfo.date.replace(/-/g, '').substring(0, 6);
      mount(initYearMonth);
    }
  }, [isFocused]);

  useEffect(() => {
    const compareDate = selectedInfo.date.replace(/-/g, '');
    let tempList;
    if (selectedCheckType === 'A') {
      tempList = list?.filter((item) => item.WA_LOG_DATE === compareDate);
    } else {
      tempList = list
        .filter((item) => item.WA_LOG_DATE === compareDate)
        .filter((item) => item.WA_TYPE === selectedCheckType);
    }
    setFilteredList(tempList);
  }, [selectedInfo, selectedCheckType]);

  const mount = async (yearMonthParam: string) => {
    setLoading(true);
    let resOfCheckType = await COMAction.getCode('code', 'PC0001', {
      GCODE: 'WA_TYPE',
    });
    const allFilter = {
      HQCODE: 'A',
      HQNAME: '전체',
    };

    const sortedArr = ['S', 'E', 'O'];
    resOfCheckType = resOfCheckType.filter((e) => {
      return sortedArr.includes(e?.HQCODE);
    });

    const sorted = resOfCheckType.sort(
      (a, b) => sortedArr.indexOf(a.HQCODE) - sortedArr.indexOf(b.HQCODE),
    );

    setCheckFilter([allFilter, ...sorted]);
    // 캘린더 가져오기
    const payload = {
      YEAR_MONTH: yearMonthParam,
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
    };
    const res = await Action.getInfoM(payload); // @@ 달력 변경 데이터 넣기
    const obj = {};
    res?.HD?.filter((item) => ['CHECK'].includes(item.M_TYPE))
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) =>
          (obj[key] = {
            customStyles: {
              container: { borderWidth: 1, borderColor: 'blue' },
            },
          }),
      );
    res?.HD?.filter((item) => ['HOLIDAY', 'WEEKEND'].includes(item.M_TYPE))
      .map((item) => item.M_DATE)
      .forEach(
        (key: string, i: number) =>
          (obj[key] = {
            ...obj[key],
            customStyles: { text: { color: '#FF585B' } },
          }),
      );
    setCalDispList(obj);
    // 리스트 가져오기 (선택된 날의 raw 데이터)
    setList(res?.DT);
    const compareDate = selectedInfo.date.replace(/-/g, '').replace(/-/g, '');
    console.log('@@ compareDate', compareDate);
    console.log('@@ res', res?.DT);
    let tempList;
    if (selectedCheckType === 'A') {
      tempList = res?.DT.filter((item) => item.WA_LOG_DATE === compareDate);
    } else {
      tempList = res?.DT.filter(
        (item) => item.WA_LOG_DATE === compareDate,
      ).filter((item) => item.WA_TYPE === selectedCheckType);
    }
    setFilteredList(tempList);
    setLoading(false);
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      {/* 캘린더 */}
      <View
        style={{
          marginVertical: 8,
        }}
      >
        <Calendar
          onDayPress={(day: any) => {
            const date = day.dateString;
            setSelectedInfo({
              date,
            });
          }}
          onMonthChange={(month: any) => {
            const date = month.dateString;
            setSelectedInfo({
              date,
            });
            const yearMonth = date.replace(/-/g, '').substring(0, 6);
            mount(yearMonth);
            if (month.year === 2025 && month.month === 10) {
              Util.toastMsg('※ 2025-11-01 부터 확인 가능합니다', 'info');
            }
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
          theme={themeOfCalendar}
        />
      </View>
      {/* (선택된 일자, 필터의) 리스트 조회 */}
      <View style={styles.workLogListSection}>
        <View style={[LVStyles.row]}>
          <Text style={styles.text}>
            {selectedInfo.date} ({dayjs(selectedInfo.date).format('ddd')})
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
                <Form
                  elem={e}
                  key={i}
                  setIsVisibleEdit={setIsVisibleEdit}
                  setIsVisibleDelete={setIsVisibleDelete}
                  setIsVisibleOff={setIsVisibleOff}
                  setOffsiteInfo={setOffsiteInfo}
                />
              ))}
            </View>
          )}
          {Util.isEmpty(filteredList) && <LVNoData />}
        </ScrollView>
      </View>
      {/* 모달 */}
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default WLO010101;

const Form = (props: any) => {
  const {
    elem,
    setIsVisibleEdit,
    setIsVisibleDelete,
    setIsVisibleOff,
    setOffsiteInfo,
  } = props;

  let bg1 = '#27A7FF';
  let bg2 = '#F0F6FA';

  if (elem.WA_TYPE === 'S') {
    bg1 = '#27A7FF';
    bg2 = '#F0F6FA';
  } else if (elem.WA_TYPE === 'E') {
    bg1 = '#003282';
    bg2 = '#EBEFF5';
  } else {
    bg1 = '#26B6A4';
    bg2 = '#EEF9F8';
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 4,
          borderRadius: 4,
          backgroundColor: bg1,
        }}
      />
      {elem?.WA_TYPE !== 'O' ? (
        // 출퇴근 카드 폼
        <View
          style={{
            flex: 1,
            borderRadius: 4,
            backgroundColor: bg2,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flex: 0.2,
            }}
          >
            <Text style={styles.label}>시간</Text>
            <Text style={styles.value}>
              {Util.convertDateTime('', elem?.WA_LOG_TIME).trim() || '-'}
            </Text>
          </View>
          <View
            style={{
              flex: 0.2,
            }}
          >
            <Text style={styles.label}>구분</Text>
            <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
          </View>
          <View
            style={{
              flex: 0.2,
            }}
          >
            <Text style={styles.label}>반경여부</Text>
            <Text style={styles.value}>{elem?.WAT_STATUS_NM || '-'}</Text>
          </View>
          <View style={{ width: 8 }} />
          <View
            style={{
              flex: 0.4,
            }}
          >
            <Text style={styles.label}>지점명</Text>
            <Text style={styles.value} numberOfLines={1}>
              {elem?.WAT_STATUS === 'Y' ? elem?.WAT_AREA_NAME : '-'}
            </Text>
          </View>
        </View>
      ) : (
        // 외근 카드 폼
        <View
          style={{
            flex: 1,
            borderRadius: 4,
            backgroundColor: bg2,
            padding: 16,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flex: 0.2,
              }}
            >
              <Text style={styles.label}>시간</Text>
              <Text style={styles.value}>
                {Util.convertDateTime('', elem?.WA_LOG_TIME).trim() || '-'}
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
              }}
            >
              <Text style={styles.label}>구분</Text>
              <Text style={styles.value}>{elem?.WA_TYPE_NM || '-'}</Text>
            </View>
            <View
              style={{
                flex: 0.6,
              }}
            >
              <Text style={styles.label}>장소</Text>
              <Text style={styles.value} numberOfLines={1}>
                {elem?.WAT_AREA_NAME || '-'}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginTop: 8,
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.label}>내용</Text>
              <Text style={styles.value} numberOfLines={1}>
                {elem?.OOO_REASON || '-'}
              </Text>
            </View>
          </View>
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
                selectedCheckType === e?.HQCODE ? '#27A7FF' : '#6A727B',
            }}
            textStyle={{
              color: selectedCheckType === e?.HQCODE ? '#27A7FF' : '#6A727B',
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const themeOfCalendar = {
  backgroundColor: '#6f6161ff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: '#39CCCC',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#39CCCC',
  dayTextColor: '#2d4150',
  monthTextColor: '#454D58',
  'stylesheet.calendar.header': {
    dayTextAtIndex0: {
      color: '#FF585B',
    },
    dayTextAtIndex6: {
      color: '#FF585B',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  textDayFontWeight: '500',
  textDayHeaderFontWeight: '600',
  textMonthFontWeight: '600',
  textMonthFontSize: 20,
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
});
