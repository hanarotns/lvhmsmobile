import {
  Divider,
  Icon,
  LVLoadingIndicator,
  LVNoData,
  RefreshControl,
  ScrollView,
  Text,
} from '@/src/components'; // 공통컴포넌트
import LVStyles from '@/src/components/LVStyles';
import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import React, { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { Util } from '@/src/lib';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Action from './Action'; // API통신

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const ACC010201 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);
  const [selectedDate, setSelectedDate] = useState(
    dayjs(new Date()).add(-1, 'month'),
  );
  const [salary, setSalary] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused, selectedDate]);

  const mount = async () => {
    setLoading(true);
    const payload = {
      SALARY_GUBUN: 'A', // A(급여)으로 값고정 (나머지 미사용)
      YEAR_MONTH: selectedDate.format('YYYYMM'),
    };
    const res = await Action.getDetailM(payload);
    setSalary(res);
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  const MovingMonth = () => (
    <View
      style={[LVStyles.row, { justifyContent: 'center', paddingVertical: 16 }]}
    >
      <TouchableOpacity
        onPress={() => {
          const temp = selectedDate.add(-1, 'month');
          setSelectedDate(temp);
        }}
      >
        <Icon name={'chevron-left'} color={'#939DAA'} />
      </TouchableOpacity>
      <Text
        style={{
          fontWeight: '800',
          fontSize: 16,
          color: '#1E2125',
          marginHorizontal: 8,
        }}
      >
        {selectedDate.format('YYYY')}년 {selectedDate.format('MM')}월
      </Text>
      <TouchableOpacity
        onPress={() => {
          const temp = selectedDate.add(+1, 'month');
          setSelectedDate(temp);
        }}
      >
        <Icon name={'chevron-right'} color={'#939DAA'} />
      </TouchableOpacity>
    </View>
  );

  const SubTitle = ({ label, value, fontColor }) => (
    <View
      style={{
        flexDirection: 'row',
        marginLeft: 8,
        marginVertical: 8,
        paddingRight: 8,
        justifyContent: 'space-between',
        flex: 1,
        // borderColor: 'gray',
        // borderWidth: 1,
        // padding: 8,
        // borderRadius: 8,
      }}
    >
      <Text
        style={{
          fontWeight: '600',
          fontSize: 16,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginLeft: 16,
          fontWeight: '800',
          fontSize: 16,
          color: fontColor || '#373747',
        }}
      >
        {value ? value + '원' : ''}
      </Text>
    </View>
  );

  const SalaryAccordion = (props: any) => {
    const { title, totalValue, primaryColor, salary, data1, data2 } = props;
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View
        style={{
          backgroundColor: '#FFF',
          marginVertical: 8,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsOpen((prev) => !prev)}
          style={{
            padding: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SubTitle
            label={title}
            value={Util.formatNumber(totalValue)}
            fontColor={primaryColor}
          />
          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} color='#666' />
        </TouchableOpacity>

        {isOpen && (
          <View
            style={{
              padding: 12,
              paddingHorizontal: 24,
              borderTopWidth: 1,
              borderTopColor: '#F0F0F0',
            }}
          >
            {data1?.map((e) => (
              <FormOfContents
                key={e.value}
                label={e.label}
                value={salary?.[e?.value]}
                unit={e?.unit}
              />
            ))}
            {data2 ? (
              <>
                <Divider
                  style={{ marginVertical: 8, backgroundColor: 'lightgray' }}
                />
                {data2?.map((e: object) => (
                  <FormOfContents
                    key={e?.value}
                    label={e?.label}
                    value={salary?.[e?.value]}
                    unit={e?.unit}
                    subContent={e?.subContent}
                  />
                ))}
              </>
            ) : (
              <></>
            )}
          </View>
        )}
      </View>
    );
  };

  const sal1 = [
    {
      label: '기본급',
      value: 'BASIC_SAL',
    },
    {
      label: '직급수당',
      value: 'POSITION_ALLOWANCE',
    },
    {
      label: '연장근로수당',
      value: 'TRANSPORTATION',
    },
    {
      label: '휴일근로(특근)수당',
      value: 'OT_HO_SAL',
    },
    {
      label: '야간근로수당',
      value: 'OT_NW_SAL',
    },
    {
      label: '기타수당',
      value: 'OTHER_SAL',
    },
    {
      label: '식대보조금',
      value: 'MESS_ALLOWANCE',
    },
  ];

  const sal2 = [
    {
      label: '소득세',
      value: 'INCOME_TAX',
    },
    {
      label: '지방소득세',
      value: 'RESIDENCE_TAX',
    },
    {
      label: '소득세연말정산',
      value: 'REFUND_INCOME_TAX',
    },
    {
      label: '지방소득세연말정산',
      value: 'REFUND_REGIONINCOME_TAX',
    },
  ];

  const sal3 = [
    {
      label: '국민연금',
      value: 'NATIONAL_PENSION',
    },
    {
      label: '건강보험',
      value: 'HEALTH_INSURANCE',
    },
    {
      label: '요양보험',
      value: 'RECUPERATION_INSURANCE',
    },
    {
      label: '고용보험',
      value: 'UNEMPLOYMENT_INSURANCE',
    },
    {
      label: '식대공제',
      value: 'MEALS_DEDUCTION',
    },
    {
      label: '기타공제',
      value: 'OTHER_DEDUCTION',
    },
    {
      label: '건강보험정산',
      value: 'HEALTH_INSURANCE_ACC',
    },
    {
      label: '요양보험정산',
      value: 'RECUPERATION_INSURANCE_ACC',
    },
  ];

  const etc1 = [
    {
      label: '통상시급',
      value: 'HOURLY_PAY',
      unit: '원',
    },
    {
      label: '연장근로시간',
      value: 'OT_HOURS',
      unit: '시간',
    },
    {
      label: '야간근로시간',
      value: 'OT_NW_HOURS',
      unit: '시간',
    },
    {
      label: '휴일근로(특근)시간',
      value: 'OT_HO_HOURS',
      unit: '시간',
    },
  ];

  const etc2 = [
    {
      label: '연장근로수당',
      value: 'TRANSPORTATION',
      subContent: [
        `${Util.formatNumber(salary?.HOURLY_PAY)} 원 X ${
          salary?.OT_HOURS
        } 시간 X 1.5 배`,
      ],
    },
    {
      label: '야간근로수당',
      value: 'OT_NW_SAL',
      subContent: [
        `${Util.formatNumber(salary?.HOURLY_PAY)} 원 X ${
          salary?.OT_NW_HOURS
        } 시간 X 0.5 배`,
      ],
    },
    {
      label: '휴일근로(특근)수당',
      value: 'OT_HO_SAL',
      subContent: [
        `${Util.formatNumber(salary?.HOURLY_PAY)} 원 X ${
          salary?.OT_HO_HOURS1
        } 시간 X 1.5 배`,
        `${Util.formatNumber(salary?.HOURLY_PAY)} 원 X ${
          salary?.OT_HO_HOURS2
        } 시간 X 2.0 배`,
      ],
    },
    {
      label: '식대공제',
      value: 'MEALS_DEDUCTION',
    },
    {
      label: '기타공제',
      value: 'OTHER_DEDUCTION',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <MovingMonth />
      <View
        style={[
          {
            borderRadius: 8,
            backgroundColor: '#6A727B',
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginHorizontal: 16,
            marginBottom: 16,
          },
        ]}
      >
        <View style={LVStyles.row}>
          <Text style={styles.text}>회사</Text>
          <Text style={styles.text}>
            {!Util.isEmpty(salary) ? salary?.COMPANY_CODE_NAME : '-'}
          </Text>
        </View>
        <View style={[LVStyles.row, { marginTop: 8 }]}>
          <Text style={styles.text}>성명</Text>
          <Text style={styles.text}>
            {!Util.isEmpty(salary) ? salary?.EMP_NAME : '-'}
          </Text>
        </View>
        {/* @@ 임의로 10일로 데이터 고정 */}
        <View style={[LVStyles.row, { marginTop: 8 }]}>
          <Text style={styles.text}>급여지급(예정)일</Text>
          <Text style={styles.text}>
            {!Util.isEmpty(salary)
              ? `${Util.convertDateTime(salary?.SALARY_PAYDAY)}`
              : '-'}
          </Text>
        </View>
        <View style={[LVStyles.row, { marginTop: 8 }]}>
          <Text style={styles.text}>지급합계액</Text>
          <Text style={[styles.text]}>
            {!Util.isEmpty(salary) ? Util.formatNumber(salary?.TOTAL_SAL) : '-'}
          </Text>
        </View>
        <View style={[LVStyles.row, { marginTop: 8 }]}>
          <Text style={styles.text}>공제합계액</Text>
          <Text style={[styles.text]}>
            {!Util.isEmpty(salary)
              ? Util.formatNumber(salary?.TOTAL_TAX + salary?.TOTAL_DEDUCTION)
              : '-'}
          </Text>
        </View>
        <View style={[LVStyles.row, { marginTop: 8 }]}>
          <Text style={styles.text}>차인지급액</Text>
          <Text style={[styles.text]}>
            {!Util.isEmpty(salary) ? Util.formatNumber(salary?.SALARY) : '-'}
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          borderBottomWidth: 1,
          borderTopWidth: 1,
          backgroundColor: '#6A727B17',
          borderColor: '#D5DCE5',
        }}
      >
        {!Util.isEmpty(salary) && (
          <ScrollView
            style={{ paddingHorizontal: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <SalaryAccordion
              title={'지급 내역'}
              totalValue={salary?.TOTAL_SAL}
              primaryColor={'#373747'}
              salary={salary}
              data1={sal1}
            />
            <SalaryAccordion
              title={'공제 내역'} // @@ 공제 총액 + 세액 총액 합치기
              totalValue={salary?.TOTAL_TAX + salary?.TOTAL_DEDUCTION}
              primaryColor={'#373747'}
              salary={salary}
              data1={sal3}
              data2={sal2}
            />
            <SalaryAccordion
              title={'계산 내역'}
              totalValue={''}
              primaryColor={'#373747'}
              salary={salary}
              data1={etc1}
              data2={etc2}
            />
          </ScrollView>
        )}
        {Util.isEmpty(salary) && <LVNoData />}
      </View>
      {loading && <LVLoadingIndicator />}
    </View>
  );
};
export default ACC010201;

const FormOfContents = (props: any) => {
  const { label, value, unit, subContent } = props;
  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={[LVStyles.row]}>
        <Text
          style={{
            color: '#6A727B',
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontWeight: '600',
          }}
        >
          {Util.formatNumber(value)}
          {unit || `원`}
        </Text>
      </View>
      {subContent?.map((e) => (
        <View style={[LVStyles.row, { paddingLeft: 16, paddingTop: 8 }]}>
          <Text
            style={{
              color: '#7A828B',
              fontWeight: '500',
            }}
          >
            {e}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
