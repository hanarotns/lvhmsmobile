import { Layout, Text, useNavigation } from '@/src/components';
import { Util } from '@/src/lib';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as icon from '@/src/assets/images';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import ko from 'date-fns/esm/locale/ko/index.js';

const now = new Date();

const time = {
  // CUR_DATE: moment().format('YYYYMMDD'),
  // CUR_TIME: moment().format('HHmm'),
  CUR_YEAR: now.getFullYear(),
  CUR_MONTH: now.getMonth(),
  CUR_DAY: now.getDate(),
};

const DateTimeField = (props) => {
  const navigation = useNavigation();
  // dateTime Picker
  const [date, setDate] = useState(
    props.date || new Date(time.CUR_YEAR, time.CUR_MONTH, time.CUR_DAY),
  );
  const [mode, setMode] = useState(props.mode);
  const [show, setShow] = useState(props.show);
  const [title] = useState(props.title);

  // 수정이여서 기존 저장된 대여기간 필드에 값이 있을경우
  const [sDateInfo] = useState(props.sDateInfo);
  const [sTimeInfo] = useState(props.sTimeInfo);
  const [eDateInfo] = useState(props.eDateInfo);
  const [eTimeInfo] = useState(props.eTimeInfo);
  const [preData] = useState(props.preData);
  const [showPreData, setShowPreData] = useState('N'); // 기존에 날짜가 있을떄 Y(게시글 수정일떄) ,신규 게시글 등록일떄 N, 수정게시글 상황에서 일자 변동됬을떄 P
  const [changeDataType, setChangeDataType] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    if (!Util.isEmpty(sDateInfo) || !Util.isEmpty(eDateInfo)) {
      setShowPreData('Y');
    }
  }, [navigation]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);

    if (event.type === 'dismissed') {
      return;
    }

    if (props.onChangeValue) {
      if (!Util.isEmpty(showPreData) && showPreData === 'Y') {
        // 대여 게시글 수정 일떄만 P로 변경해준다.
        setShowPreData('P');
      }

      if (mode === 'date') {
        props.onChangeValue('date', new Date(selectedDate));
        if (!Util.isEmpty(showPreData) && showPreData === 'Y') {
          // 대여 게시글 수정 일떄만 P로 변경해준다.
          setChangeDataType('Date');
        }
        if (showPreData === 'P' && changeDataType === 'Time') {
          setChangeDataType('Date');
        }
      } else {
        console.log('beforeTimeValue', selectedDate);
        props.onChangeValue(
          'time',
          format(new Date(selectedDate), 'HHmm', { locale: ko }),
        );

        if (!Util.isEmpty(showPreData) && showPreData === 'Y') {
          setChangeDataType('Time');
        }

        if (showPreData === 'P' && changeDataType === 'Date') {
          setChangeDataType('Time');
        }
      }
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const setDateInfo = () => {
    let formatStartDate = null;
    let formatEndDate = null;

    if (!Util.isEmpty(sDateInfo)) {
      formatStartDate = sDateInfo;
      formatStartDate = `${formatStartDate.slice(
        0,
        4,
      )}년 ${formatStartDate.slice(4, 6)}월 ${formatStartDate.slice(6, 8)}일`;
    }
    if (!Util.isEmpty(eDateInfo)) {
      formatEndDate = eDateInfo;
      formatEndDate = `${formatEndDate.slice(0, 4)}년 ${formatEndDate.slice(
        4,
        6,
      )}월 ${formatEndDate.slice(6, 8)}일`;
    }

    if (showPreData === 'Y') {
      if (preData === 'exStart') {
        return <Text style={styles.buttonTextStyle}>{formatStartDate}</Text>;
      } else if (preData === 'exEnd') {
        return <Text style={styles.buttonTextStyle}>{formatEndDate}</Text>;
      }
    } else if (
      showPreData === 'P' &&
      !Util.isEmpty(changeDataType) &&
      changeDataType === 'Time'
    ) {
      if (preData === 'exStart') {
        // return (
        //   <Text style={styles.buttonTextStyle}>{formatStartDate}</Text>
        // );
        return (
          <Text style={styles.buttonTextStyle}>
            {format(new Date(date), 'PPP', { locale: ko })}{' '}
          </Text>
        );
      } else if (preData === 'exEnd') {
        // return (
        //   <Text style={styles.buttonTextStyle}>{formatEndDate}</Text>
        // );
        return (
          <Text style={styles.buttonTextStyle}>
            {format(new Date(date), 'PPP', { locale: ko })}{' '}
          </Text>
        );
      }
    } else if (
      showPreData === 'P' &&
      !Util.isEmpty(changeDataType) &&
      changeDataType === 'Date'
    ) {
      return (
        <Text style={styles.buttonTextStyle}>
          {format(new Date(date), 'PPP', { locale: ko })}{' '}
        </Text>
      );
    } else {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 4,
          }}
        >
          <Image source={icon.ico_calendar02} style={[LVStyles.iconS]} />
          <Text style={styles.buttonTextStyle}>
            {format(new Date(date), 'P', { locale: ko })}{' '}
          </Text>
        </View>
      );
    }
  };

  const setTimeInfo = () => {
    let formatStartTime = null;
    let formatEndTime = null;

    if (!Util.isEmpty(sTimeInfo)) {
      if (sTimeInfo === '0') {
        formatStartTime = '00:00';
        return <Text style={styles.buttonTextStyle}>{formatStartTime}</Text>;
      }
      formatStartTime = sTimeInfo;
      formatStartTime = `${formatStartTime.slice(0, 2)}:${formatStartTime.slice(
        2,
        4,
      )}`;
    }
    if (!Util.isEmpty(eTimeInfo)) {
      if (eTimeInfo === '0') {
        formatEndTime = '00:00';
        return <Text style={styles.buttonTextStyle}>{formatEndTime}</Text>;
      }
      formatEndTime = eTimeInfo;
      formatEndTime = `${formatEndTime.slice(0, 2)}:${formatEndTime.slice(
        2,
        4,
      )}`;
    }

    if (showPreData === 'Y') {
      if (preData === 'exStart') {
        return <Text style={styles.buttonTextStyle}>{formatStartTime}</Text>;
      } else if (preData === 'exEnd') {
        return <Text style={styles.buttonTextStyle}>{formatEndTime}</Text>;
      }
    } else if (
      showPreData === 'P' &&
      !Util.isEmpty(changeDataType) &&
      changeDataType === 'Date'
    ) {
      if (preData === 'exStart') {
        // return (
        //   <Text style={styles.buttonTextStyle}>{formatStartTime}</Text>
        // );
        return <Text>{format(new Date(date), 'p', { locale: ko })}</Text>;
      } else if (preData === 'exEnd') {
        // return (
        //   <Text style={styles.buttonTextStyle}>{formatEndTime}</Text>
        // );
        return <Text>{format(new Date(date), 'p', { locale: ko })}</Text>;
      }
    } else if (
      showPreData === 'P' &&
      !Util.isEmpty(changeDataType) &&
      changeDataType === 'Time'
    ) {
      return <Text>{format(new Date(date), 'p', { locale: ko })}</Text>;
    } else {
      return <Text>{format(new Date(date), 'p', { locale: ko })}</Text>;
    }
  };

  return (
    <Layout>
      <View style={styles.datePickerStyle}>
        <TouchableOpacity style={styles.buttonStyle} onPress={showDatepicker}>
          {/* <Text style={styles.buttonTextStyle}> */}
          {/* {date.toDateString()} */}
          {setDateInfo()}
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          testID='dateTimePicker'
          value={date}
          mode={mode}
          is24Hour
          onChange={onChange}
          // onConfirm={setShowPreData('N')}
        />
      )}
    </Layout>
  );
};
export default DateTimeField;

const styles = StyleSheet.create({
  buttonTextStyle: {
    backgroundColor: 'rgb(247, 249, 252)',
    color: '#999FA8',
    fontWeight: '600',
    // padding: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  datePickerStyle: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  buttonStyle: {
    backgroundColor: 'rgb(247, 249, 252)',
    borderWidth: 1,
    borderColor: 'rgb(228, 233, 242)',
    borderRadius: 5,
    margin: 5,
    // flex: 1,
  },
});
