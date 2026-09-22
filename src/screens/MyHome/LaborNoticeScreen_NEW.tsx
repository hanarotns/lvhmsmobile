import { LVButton, LVColors, LVStyles } from '@/src/components';
import { Util } from '@/src/lib';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const LaborNoticeScreen = ({ type, data = {}, onConfirm }) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {type === 'NOTICE_1' && <AnnualLeaveNotice data={data} />}
          {type === 'NOTICE_1_RE' && <AnnualLeaveNotice data={data} />}
          {type === 'NOTICE_2' && <AnnualLeaveNotice2 data={data} />}
        </ScrollView>
      </View>
      <View style={LVStyles.bottomButtonView}>
        <LVButton
          title={'확인'}
          onPress={onConfirm}
          buttonStyle={LVStyles.defaultButton}
        />
      </View>
    </View>
  );
};

/**
 * 연차 촉진 1차 / 재알림
 */
const AnnualLeaveNotice = ({ data }) => {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.title}>미사용 연차휴가 사용시기 지정 촉구서</Text>
      <Text style={styles.subTitle}>
        (1차 사용촉진{data?.LABORREFUSAL_GUBUN === '1R' ? ` 재알림` : ''})
      </Text>

      <Text style={styles.subTitle}>[ 관련 : 근로기준법 제 61조 ]</Text>

      <View style={styles.table}>
        <View style={styles.row}>
          <View style={{ width: '30%' }}>
            <Cell label text='성명/사번' />
          </View>
          <View style={{ width: '70%' }}>
            <Cell text={`${data?.EMP_NAME} / ${data?.EMP_ID}`} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: '30%' }}>
            <Cell label text='소속/직위' />
          </View>
          <View style={{ width: '70%' }}>
            <Cell text={`${data?.DEPT_NAME} / ${data?.POSITION_NAME}`} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: '30%' }}>
            <Cell label text='입사일' />
          </View>
          <View style={{ width: '70%' }}>
            <Cell text={Util.convertDateTime(data?.ENTER_DATE)} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Cell label text='구분' flex={0.2} />
          <Cell
            label
            text={`적용 일수\n(${data.S_DATE || ''} 기준)`}
            flex={1}
          />
          <Cell
            label
            text={`사용연차\n(${data.YYYY || ''}.${data.MM || ''} 기준)`}
            flex={1}
          />
          <Cell label text={'미사용연차\n(연차촉진 대상)'} flex={1} />
        </View>

        <View style={styles.row}>
          <Cell text='수량' flex={0.2} />
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
          근로기준법 제61조에 의거,{' '}
          <Text style={styles.boldText}>
            {data?.NOTICE_END.substring(0, 4)}년{' '}
            {data?.NOTICE_END.substring(4, 6)}월{' '}
            {data?.NOTICE_END.substring(6, 8)}일
          </Text>{' '}
          까지 미사용 연차휴가의 사용계획을 본 App을 통해 등록하실 것을 촉구하는
          바입니다.
        </Text>

        <Text style={styles.paragraph}>
          동 기한 내에 <Text style={styles.boldText}>연차사용계획</Text> 등록이
          안 되었을 경우 관련 법규에 의해 추후 회사가 임의 지정할 예정이며,
          그럼에도 불구하고 사용하지 아니한 연차휴가는 향후 연차촉진대상이 됨을
          알려드리오니 유념하시기 바랍니다.
        </Text>
        <Text style={{ color: LVColors.warning }}>
          {`※ 적용일수는 법정 및 약정연차를 포함.`}
        </Text>
      </View>

      <View style={styles.signBox}>
        <Text style={styles.signText}>
          {data.YYYY}년 {data.MM}월 {data.DD}일
        </Text>
        <Text style={styles.signText}>{data.COMPANY_NAME_LC}(직인생략)</Text>
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
      ]}
    >
      {!empty && <Text style={styles.cellText}>{String(text) || ''}</Text>}

      {strongBorder && (
        <View pointerEvents='none' style={styles.strongBorderCell} />
      )}
    </View>
  );
};

/**
 * 연차 촉진 2차
 */
const AnnualLeaveNotice2 = ({ data }) => {
  // const totalVacationDays = data.vacationSchedules.reduce(
  //   (sum, item) => sum + item.days,
  //   0,
  // );

  return (
    <View style={styles.document}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>미사용 연차휴가 사용시기 지정 통보서</Text>

        <Text style={styles.subTitle}>(2차 사용촉진)</Text>
      </View>

      <View style={styles.employeeInfo}>
        <View style={styles.employeeRow}>
          <Text style={styles.employeeLabel}>성명/사번:</Text>

          <Text style={styles.employeeValue}>
            {data?.EMP_NAME} / {data?.EMP_ID}
          </Text>
        </View>

        <View style={styles.employeeRow}>
          <Text style={styles.employeeLabel}>소속/직위:</Text>

          <Text style={styles.employeeValue}>
            {data?.DEPT_NAME} / {data?.POSITION_NAME}
          </Text>
        </View>

        <View style={styles.employeeRow}>
          <Text style={styles.employeeLabel}>입사일:</Text>

          <Text style={styles.employeeValue}>
            {Util.convertDateTime(data?.ENTER_DATE)}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        회사는 근로기준법 제61조에 따라 귀하의 미사용 연차유급휴가 사용을
        촉진하기 위하여, 아래와 같이 연차유급휴가 사용시기를 지정하여
        통보합니다.
      </Text>

      <SectionTitle number='1' title='대상 연차 내역' />

      <View style={styles.detailContainer}>
        <DetailRow
          label='연차 발생 대상기간'
          value={`${Util.convertDateTime(data?.APPLY_S_DATE)} ~ ${Util.convertDateTime(data?.APPLY_E_DATE)}`}
        />

        <DetailRow
          label='1차 촉구일'
          value={Util.convertDateTime(data?.FIRST_NOTICE_DATE)}
        />

        <DetailRow
          label='1차 촉구에 따른 사용계획 회신기한'
          value={Util.convertDateTime(data?.FIRST_RE_NOTICE_DEADLINE)}
        />

        <DetailRow label='미사용 연차 일수' value={`총 ${data.REM_VC_QTY}일`} />
      </View>

      <SectionTitle number='2' title='사용시기 지정 내용' />

      <Text style={styles.description}>
        귀하가 1차 연차사용 촉구를 받은 날부터 10일 이내에 미사용 연차휴가의
        전부 또는 일부의 사용시기를 통보하지 아니하였으므로, 회사는 아래와 같이
        미사용 연차휴가의 사용시기를 지정하여 통보합니다.
      </Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.sequenceCell]}>
            <Text style={styles.tableHeaderText}>연번</Text>
          </View>

          <View style={[styles.tableCell, styles.dateCell]}>
            <Text style={styles.tableHeaderText}>지정 휴가일</Text>
          </View>

          <View style={[styles.tableCell, styles.daysCell]}>
            <Text style={styles.tableHeaderText}>일수</Text>
          </View>
        </View>

        {data?.DETAILS?.map((schedule, index) => (
          <View key={schedule.WORK_DATE} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.sequenceCell]}>
              <Text style={styles.tableText}>{index + 1}</Text>
            </View>

            <View style={[styles.tableCell, styles.dateCell]}>
              <Text style={styles.tableText}>
                {Util.convertDateTime(schedule.WORK_DATE)}
              </Text>
            </View>

            <View style={[styles.tableCell, styles.daysCell]}>
              <Text style={styles.tableText}>{schedule.VC_QTY}일</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>합계: {data?.REM_VC_QTY}일</Text>
      </View>

      <Text style={{ color: LVColors.warning }}>
        {`※ 해당연차는 법정 및 약정연차를 포함.`}
      </Text>

      <View style={styles.noticeContainer}>
        <Text style={styles.noticeText}>
          ※ 단, 지정 휴가일이 근무 스케줄에 따른 휴무일인 경우, 그 다음 첫
          근무일을 사용시기로 지정합니다.
        </Text>
      </View>

      <Text style={styles.companyName}>{data?.COMPANY_NAME_LC}</Text>
    </View>
  );
};
const SectionTitle = ({ number, title }: { number: string; title: string }) => {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>
    </View>
  );
};
const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.bullet}>•</Text>

      <Text style={styles.detailLabel}>{label}:</Text>

      <Text style={styles.detailValue}>{value}</Text>
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
    fontSize: 18,
    fontWeight: '800',
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
  row: {
    flexDirection: 'row',
  },
  cell: {
    minHeight: 48,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#777777',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    position: 'relative',
  },
  labelCell: {
    backgroundColor: '#F0F2F6',
  },
  emptyCell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  strongBorderCell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#777777',
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
    lineHeight: 32,
  },
  subContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    height: '100%',
    padding: 8,
  },
  contentContainer: {
    padding: 16,
  },
  document: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  employeeInfo: {
    marginBottom: 24,
    gap: 12,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeLabel: {
    width: 82,
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  employeeValue: {
    flex: 1,
    paddingBottom: 4,
    fontSize: 14,
    color: '#222222',
    borderBottomWidth: 1,
    borderBottomColor: '#555555',
  },
  description: {
    fontSize: 14,
    lineHeight: 23,
    color: '#333333',
  },
  sectionTitleContainer: {
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  detailContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginRight: 6,
    fontSize: 14,
    lineHeight: 21,
    color: '#222222',
  },
  detailLabel: {
    marginRight: 6,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#222222',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#333333',
  },
  table: {
    marginTop: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#777777',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  tableHeader: {
    backgroundColor: '#F0F2F6',
  },
  tableCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#777777',
  },
  sequenceCell: {
    width: 52,
  },
  dateCell: {
    flex: 1,
  },
  daysCell: {
    width: 70,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },
  tableText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  noticeContainer: {
    marginTop: 28,
    padding: 14,
    backgroundColor: '#F7F8FA',
    borderRadius: 6,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 21,
    color: '#555555',
  },
  companyName: {
    marginTop: 40,
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },
});

export default LaborNoticeScreen;
