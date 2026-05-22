import { LVButton } from '@/src/components';
import LVStyles from '@/src/components/LVStyles';
import React from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

const LaborNoticeScreen = ({ type = 'annual', data = {}, onConfirm }) => {
  const isAnnual = type === 'annual';

  return (
    <View style={styles.container}>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#F0F2F6',
          height: '100%',
          padding: 8,
        }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isAnnual ? (
            <AnnualLeaveNotice data={data} />
          ) : (
            <LaborRefusalNotice data={data} />
          )}
        </ScrollView>
      </View>
      <View style={styles.bottomButtonView}>
        <LVButton
          title={'확인'}
          onPress={onConfirm}
          buttonStyle={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const AnnualLeaveNotice = ({ data }) => {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.title}>미사용 연차유급휴가 사용촉진 통지</Text>
      <Text style={styles.subTitle}>[ 관련 : 근로기준법 제 61조 ]</Text>

      <View style={styles.infoTable}>
        <View style={styles.row}>
          <Cell label text='부서' />
          <Cell text={data.DEPT_NAME} />
          <Cell empty />
          <Cell label text='성명/직책' />
          <Cell text={data.EMP_NAME} />
          <Cell text={data.POSITION_NAME} />
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Cell label text='구분' flex={1} />
          <Cell
            label
            text={`${data.S_DATE || ''} 기준\n연차발생 일수`}
            flex={1}
          />
          <Cell
            label
            text={`사용연차\n(${data.YYYY || ''}.${data.MM || ''} 기준)`}
            flex={1}
          />
          <Cell label text='미사용연차(연차촉진 대상 연차)' flex={1} />
        </View>

        <View style={styles.row}>
          <Cell text='연차휴가일수' flex={1} />
          <Cell text={data.VC_QTY} flex={1} />
          <Cell text={data.VA_PERIOD} flex={1} />
          <Cell text={data.REM_VC_QTY} flex={1} strongBorder />
        </View>
      </View>

      <View style={styles.paragraphBox}>
        <Text style={styles.boldText}>
          {data.YYYY}년 {data.MM}월 {data.DD}일 ~ {data.E_YYYY}년 {data.E_MM}월{' '}
          {data.E_DD}일 사용 가능한 연차 유급 휴가일수는 {data.REM_VC_QTY}일
          임을 알려드립니다.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>{data.ENROLL_DATE}까지 </Text>
          미사용 연차유급휴 일수의 사용 시기를 지정하고 nPortal시스템을 통하여
          사용예정 등록하실 것을 촉구하는 바입니다.
        </Text>

        <Text style={styles.paragraph}>
          동 기한내에 <Text style={styles.boldText}>[연차사용예정]</Text> 등록이
          안되었을 경우 관련 법규에 의해 추후 회사가 임의 지정할 예정이며,
          그럼에도 불구하고 사용하지 아니한 연차 유급휴가 일수에 대하여는 향후
          연차촉진대상이 됨을 알려드리니 유념하시기 바랍니다.
        </Text>
      </View>

      <View style={styles.signBox}>
        <Text style={styles.signText}>
          {data.YYYY}년 {data.MM}월 {data.DD}일
        </Text>
        <Text style={styles.signText}>{data.COMPANY_NAME_LC}(직인생략)</Text>
      </View>

      <View style={styles.lawBox}>
        <Text style={styles.lawTitle}>[ 관련법령 : 근로기준법 제61조 ]</Text>
        <Text style={styles.lawText}>
          사용자가 제60조 제1항ᆞ제3항 및 제4항의 규정에 의한 유급휴가의 사용을
          촉진하기 위하여 다음 각 호의 조치를 하였음에도 불구하고 근로자가
          휴가를 사용하지 아니하여 제60조 제7항 본문의 규정에 따라 소멸된
          경우에는 사용자는 그 미사용 휴가에 대하여 보상할 의무가 없으며, 제60조
          제7항 단서의 규정에 의한 사용자의 귀책사유에 해당하지 아니하는 것으로
          본다.
        </Text>
        <Text style={styles.lawText}>{'<개정2012.02.01,2017.11.28>'}</Text>
        <Text style={styles.lawText}>
          1. 제60조 제7항 본문의 규정에 의하여 사용자가 근로자별로 미사용 휴가
          일수를 알려주고, 근로자가 그 사용시기를 정하여 사용자에게 통보하도록
          서면으로 촉구할 것.
        </Text>
        <Text style={styles.lawText}>
          2. 제1호의 규정에 의한 촉구에도 불구하고 근로자가 촉구를 받은 때부터
          10일 이내에 미사용휴가의 전부 또는 일부의 사용 시기를 정하여
          사용자에게 통보하지 아니한 경우에는 제60조 제7항 본문의 규정에 의한
          기간이 끝나기 1개월 전까지 사용자가 미사용 휴가의 사용 시기를 정하여
          근로자에게 서면으로 통보할 것.
        </Text>
      </View>
    </View>
  );
};

const LaborRefusalNotice = ({ data }) => {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.title}>노무수령거부통지서</Text>

      <View style={styles.simpleInfoBox}>
        <View style={styles.simpleRow}>
          <Text style={styles.simpleLabel}>성명</Text>
          <Text style={styles.simpleValue}>
            [{data.EMP_ID}] {data.EMP_NAME}
          </Text>
        </View>

        <View style={styles.simpleRow}>
          <Text style={styles.simpleLabel}>일자</Text>
          <Text style={styles.simpleValue}>{data.PLAN_DATE}</Text>
        </View>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          귀하는 근로기준법 제61조(연차 유급휴가 사용촉진)에 의거
          {'\n\n'}
          회사에 제출한 [ 미사용 연차유급휴가 사용시기 지정 통보서 ]에
          {'\n\n'}
          통보일 당일 연차휴가임을 회사에 통보한 바,
          {'\n\n'}
          귀하는 당일 회사에 노무제공 할 의무가 없고,
          {'\n\n'}
          회사에서는 귀하의 노무수령을 거부하니,
          {'\n\n'}
          즉시 퇴근하기 바랍니다.
          {'\n\n'}본 통지서를 수령하고도 귀하가 노무를 제공할지라도
          {'\n\n'}
          회사는 동법에 의거 귀하의 연차일수에서
          {'\n\n'}
          하루를 공제하니 이점 유념하기 바랍니다.
        </Text>
      </View>
    </View>
  );
};

const Cell = (props) => {
  const { text, label, empty, flex = 1, strongBorder } = props;
  return (
    <View
      style={[
        styles.cell,
        { flex },
        label && styles.labelCell,
        empty && styles.emptyCell,
        strongBorder && styles.strongBorderCell,
      ]}
    >
      {!empty && <Text style={styles.cellText}>{String(text) || ''}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  noticeBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoTable: {
    marginTop: 12,
    marginBottom: 20,
  },
  table: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  labelCell: {
    backgroundColor: '#c0cdef',
  },
  emptyCell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  strongBorderCell: {
    borderWidth: 2,
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  paragraphBox: {
    marginTop: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
  },
  boldText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
  },
  signBox: {
    marginVertical: 36,
    alignItems: 'center',
  },
  signText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 2,
  },
  lawBox: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
  },
  lawTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  lawText: {
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 8,
  },
  simpleInfoBox: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  simpleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    minHeight: 48,
    alignItems: 'center',
  },
  simpleLabel: {
    width: 80,
    fontWeight: '700',
    fontSize: 14,
  },
  simpleValue: {
    flex: 1,
    fontSize: 14,
  },
  messageBox: {
    marginTop: 28,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 25,
  },
  bottomButtonView: {
    ...LVStyles.row,
    padding: 32,
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

export default LaborNoticeScreen;
