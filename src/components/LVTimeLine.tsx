import Text from '@/src/components/CustomText';
import dayjs from 'dayjs';
import React from 'react';
import {
  FlatList,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Util } from '../lib';

export type LVTimeLineStatus =
  | 'completed'
  | 'current'
  | 'upcoming'
  | 'rejected';

export interface LVTimeLineData {
  FROM_DATE: string;
  TO_DATE: string;

  ADD_DATE?: string;
  APPROVAL_CHECK?: string;
  APPROVAL_NO?: string;
  AP_STATUS?: string;
  AP_STATUS_NAME?: string;
  COMPANY_CODE?: string;
  CONFIRM_DATE?: string;
  DEPT_CODE?: string;
  DEPT_NAME?: string;
  EMAIL?: string;
  EMP_ID?: string;
  EMP_NAME?: string;
  JOB_NO?: string;
  LAST_ID?: string;
  LAST_NAME?: string;
  NEXT_ID?: string;
  NEXT_NAME?: string;
  PERIOD?: number;
  POSITION_CODE?: string;
  POSITION_NAME?: string;
  REM_VC_QTY?: number;
  RQ_TYPE?: string;
  R_VA_TYPE?: string;
  VA_END?: string;
  VA_START?: string;

  [key: string]: unknown;
}

export interface LVTimeLineItem {
  LEVEL: number;
  TITLE: string;
  SUBTITLE?: string;
  CONFIRM_DATE: string;
  CONFIRM_TIME: string;
  DATA: LVTimeLineData;
}

interface LVTimeLineProps {
  data: LVTimeLineItem[];

  /**
   * 타임라인 항목 선택
   */
  onPressItem?: (item: LVTimeLineItem, index: number) => void;

  /**
   * 현재 날짜
   *
   * 기본값: 오늘
   * 테스트 시 '20260721'처럼 전달 가능
   */
  currentDate?: string;

  /**
   * 부모 ScrollView 안에서 사용할 경우 false
   */
  scrollEnabled?: boolean;

  /**
   * 전체 스타일
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 카드 스타일
   */
  cardStyle?: StyleProp<ViewStyle>;

  /**
   * 상태를 직접 판단해야 하는 경우
   */
  getStatus?: (item: LVTimeLineItem, currentDate: string) => LVTimeLineStatus;

  /**
   * 카드 하단에 추가 UI가 필요한 경우
   */
  renderFooter?: (item: LVTimeLineItem, index: number) => React.ReactNode;

  /**
   * 데이터가 없을 때 표시
   */
  emptyComponent?: React.ReactNode;
}

interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
  lineColor: string;
}

const STATUS_CONFIG: Record<LVTimeLineStatus, StatusConfig> = {
  completed: {
    label: '완료',
    color: '#27A7FF',
    backgroundColor: '#EEF8FF',
    lineColor: '#27A7FF55',
  },
  current: {
    label: '진행 중',
    color: '#26B6A4',
    backgroundColor: '#EEF9F8',
    lineColor: '#26B6A4',
  },
  upcoming: {
    label: '예정',
    color: '#8A939D',
    backgroundColor: '#F0F2F6',
    lineColor: '#D5DCE5',
  },
  rejected: {
    label: '반려',
    color: '#E54D4D',
    backgroundColor: '#FFF1F1',
    lineColor: '#E54D4D',
  },
};

const formatDate = (date?: string) => {
  if (!date || date.length !== 8) {
    return '-';
  }

  return dayjs(date, 'YYYYMMDD').format('YYYY.MM.DD');
};

const formatTime = (time?: string) => {
  if (!time || time.length !== 4) {
    return '';
  }

  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
};

const formatDateTime = (date?: string, time?: string) => {
  if (!date) {
    return '-';
  }

  const formattedDate = formatDate(date);
  const formattedTime = formatTime(time);

  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
};

const defaultGetStatus = (
  item: LVTimeLineItem,
  currentDate: string,
): LVTimeLineStatus => {
  const { FROM_DATE, TO_DATE, AP_STATUS, APPROVAL_CHECK } = item.DATA;

  if (AP_STATUS === 'R') {
    return 'rejected';
  }

  if (item.CONFIRM_DATE || AP_STATUS === 'A' || APPROVAL_CHECK === 'Y') {
    return 'completed';
  }

  if (
    FROM_DATE &&
    TO_DATE &&
    currentDate >= FROM_DATE &&
    currentDate <= TO_DATE
  ) {
    return 'current';
  }

  return 'upcoming';
};

interface InfoRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const InfoRow = ({ label, value, highlight = false }: InfoRowProps) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={[styles.infoValue, highlight && styles.highlightValue]}>
        {value}
      </Text>
    </View>
  );
};

const LVTimeLine = ({
  data,
  onPressItem,
  currentDate = dayjs().format('YYYYMMDD'),
  scrollEnabled = false,
  style,
  cardStyle,
  getStatus = defaultGetStatus,
  renderFooter,
  emptyComponent,
}: LVTimeLineProps) => {
  return (
    <FlatList
      data={data}
      style={style}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => `${item.LEVEL}-${item.TITLE}-${index}`}
      ListEmptyComponent={emptyComponent ? <>{emptyComponent}</> : null}
      renderItem={({ item, index }) => {
        const status = getStatus(item, currentDate);
        const config = STATUS_CONFIG[status];

        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        const statusLabel = item.DATA.AP_STATUS_NAME || config.label;

        const cardContent = (
          <>
            <View style={styles.headerRow}>
              <View style={styles.titleArea}>
                <Text style={[styles.stepText, { color: config.color }]}>
                  {item.LEVEL}단계
                </Text>

                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.TITLE}</Text>

                  {!!item.SUBTITLE && (
                    <View style={styles.subtitleBadge}>
                      <Text style={styles.subtitleText}>{item.SUBTITLE}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: config.backgroundColor,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: config.color }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoArea}>
              <InfoRow
                label={item.CODE !== 4 ? '알림기간' : '부여일자'}
                value={
                  item.CODE !== 4
                    ? `${Util.convertDateTime(
                        item.DATA.FROM_DATE,
                      )} ~ ${Util.convertDateTime(item.DATA.TO_DATE)}`
                    : Util.convertDateTime(item.DATA.FROM_DATE)
                }
              />

              <InfoRow
                label='확인일시'
                value={
                  Util.convertDateTime(item.CONFIRM_DATE, item.CONFIRM_TIME) ||
                  '미확인'
                }
              />
            </View>
            {item.DATA.PERIOD && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoArea}>
                  {typeof item.DATA.PERIOD === 'number' && (
                    <InfoRow
                      label='신청일수'
                      value={`${item.DATA.PERIOD}일`}
                      highlight
                    />
                  )}
                  {!!item.DATA.VA_START && !!item.DATA.VA_END && (
                    <InfoRow
                      label='신청기간'
                      value={`${Util.convertDateTime(item.DATA.VA_START)} ~ ${Util.convertDateTime(
                        item.DATA.VA_END,
                      )}`}
                    />
                  )}
                </View>
              </>
            )}

            {renderFooter?.(item, index)}
          </>
        );

        return (
          <View style={styles.itemContainer}>
            <View style={styles.timelineArea}>
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: config.color,
                    backgroundColor:
                      status === 'current' ? config.color : '#FFFFFF',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.levelText,
                    {
                      color: status === 'current' ? '#FFFFFF' : config.color,
                    },
                  ]}
                >
                  {item.LEVEL}
                </Text>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.bottomLine,
                    {
                      borderColor: '#27A7FF',
                      borderRightWidth: 1,
                      borderStyle: 'dashed',
                    },
                  ]}
                />
              )}
            </View>

            {onPressItem ? (
              <TouchableOpacity
                activeOpacity={0.75}
                style={[
                  styles.card,
                  status === 'current' && {
                    borderColor: config.color,
                    backgroundColor: config.backgroundColor,
                  },
                  cardStyle,
                ]}
                onPress={() => onPressItem(item, index)}
              >
                {cardContent}
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.card,
                  status === 'current' && {
                    borderColor: config.color,
                    backgroundColor: config.backgroundColor,
                  },
                  cardStyle,
                ]}
              >
                {cardContent}
              </View>
            )}
          </View>
        );
      }}
    />
  );
};

export default LVTimeLine;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timelineArea: {
    position: 'relative',
    width: 42,
    alignItems: 'center',
    paddingTop: 12,
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  levelText: {
    fontSize: 13,
    fontWeight: '700',
  },

  topLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 8,
  },

  bottomLine: {
    position: 'absolute',
    top: 12,
    bottom: -12,
    // width: 2,
  },

  card: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E7EC',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleArea: {
    flex: 1,
    paddingRight: 12,
  },

  stepText: {
    marginBottom: 5,
    fontSize: 12,
    fontWeight: '600',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  title: {
    color: '#20252B',
    fontSize: 16,
    fontWeight: '700',
  },

  subtitleBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FFF4E8',
  },

  subtitleText: {
    color: '#F08A24',
    fontSize: 11,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#EDF0F3',
  },

  infoArea: {
    gap: 9,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoLabel: {
    width: 68,
    color: '#8A939D',
    fontSize: 13,
    lineHeight: 19,
  },

  infoValue: {
    flex: 1,
    color: '#3C434B',
    fontSize: 13,
    lineHeight: 19,
  },

  highlightValue: {
    color: '#20252B',
    fontWeight: '700',
  },
});
