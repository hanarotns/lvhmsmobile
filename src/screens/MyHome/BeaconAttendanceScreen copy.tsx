import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Icon, LVButton, LVColors, Text } from '@/src/components';
import { useIsFocused } from '@react-navigation/native';

import type { BeaconScanStatus } from '@/src/beacon/useBeaconScanner';
import { useBeaconScanner } from '@/src/beacon/useBeaconScanner';
import dayjs from 'dayjs';

interface EmployeeInfo {
  EMP_ID?: string;
  EMP_NAME_LC?: string;
}

interface BeaconAttendanceScreenProps {
  empInfo: EmployeeInfo;
}

type Tone = 'searching' | 'detected' | 'problem';

const TONE_BY_STATUS: Record<BeaconScanStatus, Tone> = {
  idle: 'searching',
  'requesting-permission': 'searching',
  scanning: 'searching',
  detected: 'detected',
  'permission-denied': 'problem',
  'bluetooth-off': 'problem',
  error: 'problem',
};

const STATUS_TITLE: Record<BeaconScanStatus, string> = {
  idle: '비콘을 찾는 중이에요',
  'requesting-permission': '비콘을 찾는 중이에요',
  scanning: '비콘을 찾는 중이에요',
  detected: '출입 게이트가 감지됐어요',
  'permission-denied': '블루투스 권한이 필요해요',
  'bluetooth-off': '블루투스가 꺼져 있어요',
  error: '비콘 스캔에 문제가 발생했어요',
};

const TONE_COLOR: Record<Tone, { ring: string; fill: string; icon: string }> = {
  searching: {
    ring: '#D7DEE8',
    fill: '#EEF2F7',
    icon: '#8994A3',
  },
  detected: {
    ring: LVColors.primary,
    fill: LVColors.primary,
    icon: '#FFFFFF',
  },
  problem: {
    ring: LVColors.warning,
    fill: LVColors.warning,
    icon: '#FFFFFF',
  },
};

const TONE_ICON: Record<Tone, string> = {
  searching: 'bluetooth',
  detected: 'bluetooth-connect',
  problem: 'bluetooth-off',
};

const RING_OUTER = 210;
const RING_MID = 164;
const RING_INNER = 116;

const LAST_RECORD_COLOR = '#16B364';

const BeaconAttendanceScreen = ({ empInfo }: BeaconAttendanceScreenProps) => {
  const isFocused = useIsFocused();
  const { status, startScan, stopScan } = useBeaconScanner();
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.format('YYYY-MM-DD');
  const formattedTime = currentTime.format('HH:mm:ss');

  useEffect(() => {
    if (isFocused) {
      void startScan();
    } else {
      stopScan();
    }
  }, [isFocused, startScan, stopScan]);

  const tone = TONE_BY_STATUS[status];
  const isDetected = tone === 'detected';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
            전자 출입증
          </Text>
        </View>

        <View style={styles.radarArea}>
          <BeaconRadar tone={tone} />
        </View>

        {/* 
        <View style={styles.statusTextArea}>
          <Text style={styles.statusTitle}>{STATUS_TITLE[status]}</Text>

          {tone === 'searching' && (
            <Text style={styles.statusSubtitle}>
              출입 게이트 가까이 다가가 주세요
            </Text>
          )}
        </View>

        {tone !== 'detected' && (
          <View style={styles.helpBox}>
            <Text style={styles.helpText}>계속 인식되지 않나요?</Text>

            <Text style={styles.helpSubText}>
              블루투스가 켜져 있는지 확인하고, 그래도 안 되면 센터 관리자에게
              수기 출입 요청을 보내주세요.
            </Text>
          </View>
        )}

        {status === 'permission-denied' && (
          <TouchableOpacity onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsLink}>설정으로 이동</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} /> 
        */}

        {/* 출입하기: 이번 차수는 순수 시각 상태만 표시하고 실제 출입 기록 동작은 없다. */}
        <LVButton
          disabled={!isDetected}
          title={'출입하기'}
          onPress={() => {}}
          buttonStyle={{ width: '85%' }}
        />
      </View>

      {/* 최근 출입 */}
      <View style={styles.lastRecordCard}>
        <View style={styles.lastRecordIcon}>
          <Icon name='check' size={16} color={LAST_RECORD_COLOR} />
        </View>

        <View style={styles.lastRecordContent}>
          <View style={styles.lastRecordInfo}>
            <Text style={styles.lastRecordLabel}>최근 출입</Text>
            <Text style={styles.lastRecordCenter}>{`통물1센터`}</Text>
          </View>
          <View style={styles.lastRecordInfo}>
            <Text style={styles.lastRecordDate}>{`2026-09-01 12:34:56`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BeaconAttendanceScreen;

/**
 * 원형 레이더 인디케이터.
 * '검색 중'일 때만 바깥 두 링이 pulse(scale+opacity)로 동작한다.
 */
const BeaconRadar = ({ tone }: { tone: Tone }) => {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();

    ring1.setValue(0);
    ring2.setValue(0);

    if (tone !== 'searching') {
      return;
    }

    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(value, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),

          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const loop = Animated.parallel([
      makePulse(ring1, 0),
      makePulse(ring2, 900),
    ]);

    loopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
    };
  }, [tone, ring1, ring2]);

  const colors = TONE_COLOR[tone];

  const ringStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    }),

    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.radarWrap}>
      {tone === 'searching' ? (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: RING_OUTER,
                height: RING_OUTER,
                borderRadius: RING_OUTER / 2,
                borderColor: colors.ring,
              },
              ringStyle(ring2),
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              {
                width: RING_MID,
                height: RING_MID,
                borderRadius: RING_MID / 2,
                borderColor: colors.ring,
              },
              ringStyle(ring1),
            ]}
          />
        </>
      ) : (
        <>
          <View
            style={[
              styles.solidRing,
              {
                width: RING_OUTER,
                height: RING_OUTER,
                borderRadius: RING_OUTER / 2,
                backgroundColor: colors.fill,
                opacity: 0.1,
              },
            ]}
          />

          <View
            style={[
              styles.solidRing,
              {
                width: RING_MID,
                height: RING_MID,
                borderRadius: RING_MID / 2,
                backgroundColor: colors.fill,
                opacity: 0.2,
              },
            ]}
          />
        </>
      )}

      <View
        style={[
          styles.innerCircle,
          {
            width: RING_INNER,
            height: RING_INNER,
            borderRadius: RING_INNER / 2,
            backgroundColor: colors.fill,
          },
        ]}
      >
        <Icon name={TONE_ICON[tone]} size={42} color={colors.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  /*
   * 전자 출입증
   */
  card: {
    marginHorizontal: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingBottom: 24,
    alignItems: 'center',
    borderColor: '#EEF0F3',
    // iOS
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    // Android
    elevation: 3,
  },
  cardTitle: {
    width: '100%',
    paddingVertical: 20,
    backgroundColor: '#27A7FFCC',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  /*
   * Radar
   */
  radarArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 28,
  },
  radarWrap: {
    width: RING_OUTER,
    height: RING_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  solidRing: {
    position: 'absolute',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  /*
   * Status
   * 현재 JSX에서 주석 처리되어 있지만
   * 추후 다시 활성화할 수 있도록 유지
   */
  statusTextArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LVColors.text,
    textAlign: 'center',
  },
  statusSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: LVColors.subText,
    textAlign: 'center',
  },
  /*
   * Help
   */
  helpBox: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '700',
    color: LVColors.text,
  },
  helpSubText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: LVColors.subText,
  },
  settingsLink: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: LVColors.primary,
    textAlign: 'center',
  },
  /*
   * 최근 출입
   */
  lastRecordCard: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },
  lastRecordIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF3',
  },
  lastRecordContent: {
    flex: 1,
    marginLeft: 12,
  },
  lastRecordLabel: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#98A2B3',
  },
  lastRecordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRecordCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#344054',
  },
  lastRecordDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#667085',
  },
  timeContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 15,
    color: '#999',
    marginBottom: 6,
  },
  date: {
    fontSize: 20,
    color: '#777',
    marginBottom: 4,
  },
  time: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 1,
  },
});
