import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Icon, LVButton, LVColors, Text } from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused } from '@react-navigation/native';

import type { BeaconScanStatus } from '@/src/beacon/useBeaconScanner';
import { useBeaconScanner } from '@/src/beacon/useBeaconScanner';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as WLOAction from '../WorkLog/Action';

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

interface EmployeeInfo {
  COMPANY_CODE?: string;
  EMP_ID?: string;
  EMP_NAME_LC?: string;
}

interface BeaconAttendanceScreenProps {
  empInfo: EmployeeInfo;
}

type Tone = 'searching' | 'detected' | 'problem';

type AccessResult = 'success' | 'fail';

interface LastAccessRecordProps {
  result: AccessResult;
  centerName: string;
  dateTime: string;
}

/**
 * ============================================================================
 * Beacon Config
 * ============================================================================
 */

const TONE_BY_STATUS: Record<BeaconScanStatus, Tone> = {
  idle: 'searching',
  'requesting-permission': 'searching',
  scanning: 'searching',
  detected: 'detected',
  'permission-denied': 'problem',
  'bluetooth-off': 'problem',
  error: 'problem',
};

const TONE_COLOR: Record<
  Tone,
  {
    ring: string;
    fill: string;
    icon: string;
  }
> = {
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

/**
 * ============================================================================
 * Access Result Config
 * ============================================================================
 */

const ACCESS_RESULT_CONFIG = {
  success: {
    label: '최근 출입',
    icon: 'check',
    color: '#16B364',
    backgroundColor: '#ECFDF3',
  },

  fail: {
    label: '실패',
    icon: 'close',
    color: '#F04438',
    backgroundColor: '#FEF3F2',
  },
} as const;

/**
 * ============================================================================
 * Radar Size
 * ============================================================================
 */

const RING_OUTER = 210;
const RING_MID = 164;
const RING_INNER = 116;

/**
 * ============================================================================
 * Main Screen
 * ============================================================================
 */

const BeaconAttendanceScreen = ({
  empInfo,
  setLoading,
}: BeaconAttendanceScreenProps) => {
  const [currentRecord, setCurrentRecord] = useState({});

  const isFocused = useIsFocused();

  const { status, matchedBeacon, error, startScan, stopScan } =
    useBeaconScanner();

  /**
   * 스캔 시작 시각
   *
   * status가 변경될 때마다
   * startScan 이후 몇 ms가 지났는지 확인하기 위해 사용
   */
  const scanStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    const payload = {};
    const result = await WLOAction.getCurrentBeaconRecordM(payload);
    setCurrentRecord(result);
  };

  const handleSave = async () => {
    const deviceInfo = await AsyncStorage.getItem('deviceInfo');
    const deviceId = await AsyncStorage.getItem('deviceId');
    const commonInfo = {
      COMPANY_CODE: empInfo?.COMPANY_CODE,
      EMP_ID: empInfo?.EMP_ID,
      WA_LOG_DATETIME: dayjs(new Date()).format('YYYYMMDDHHmmss'),
      WA_LOG_DATE: dayjs(new Date()).format('YYYYMMDD'),
      WA_LOG_TIME: dayjs(new Date()).format('HHmm'),
      WA_GUBUN: 'GW', // GW(일반)으로 값고정 (나머지 미사용)
      WA_TYPE: '',
      FWH_TYPE: 'S', // 간주근로'A' 미사용으로 선택 일반/선택'S' 하드코딩
      MOBILE_INFO: deviceInfo,
      MOBILE_TOKEN: deviceId,
    };
    if (!matchedBeacon) {
      console.log('');
      console.log('📭 [BEACON] matchedBeacon = null');
      return;
    }
    const payload = [
      {
        ...commonInfo,
        UUID: matchedBeacon.uuid,
        MAJOR: matchedBeacon.major,
        MINOR: matchedBeacon.minor,
      },
    ];
    setLoading(true);
    await WLOAction.saveBeaconM(payload);
    setLoading(false);
    const payload2 = {};
    const result = await WLOAction.getCurrentBeaconRecordM(payload2);
    setCurrentRecord(result);
  };

  /**
   * ============================================================================
   * 화면 활성화 여부에 따라 비콘 스캔 시작/종료
   * ============================================================================
   */
  useEffect(() => {
    if (isFocused) {
      scanStartedAtRef.current = Date.now();

      console.log('');
      console.log('========================================');
      console.log('🚀 [BEACON] START SCAN');
      console.log('TIME:', new Date().toISOString());
      console.log('========================================');

      void startScan();
    } else {
      console.log('');
      console.log('========================================');
      console.log('🛑 [BEACON] STOP SCAN');
      console.log('TIME:', new Date().toISOString());
      console.log('========================================');

      scanStartedAtRef.current = null;

      stopScan();
    }
  }, [isFocused, startScan, stopScan]);

  /**
   * ============================================================================
   * Beacon Status 변화 확인
   * ============================================================================
   *
   * 예상 흐름
   *
   * requesting-permission
   *        ↓
   * scanning
   *        ↓
   * detected
   *        ↓
   * (비콘 신호가 10초 이상 사라짐)
   *        ↓
   * scanning
   */
  useEffect(() => {
    const now = Date.now();

    const elapsed = scanStartedAtRef.current
      ? now - scanStartedAtRef.current
      : 0;

    console.log('');
    console.log('----------------------------------------');
    console.log('📡 [BEACON STATUS]');
    console.log('STATUS  :', status);
    console.log('ELAPSED :', `${elapsed}ms`);
    console.log('TIME    :', new Date(now).toISOString());
    console.log('----------------------------------------');
  }, [status]);

  /**
   * ============================================================================
   * 감지된 Beacon 정보 확인
   * ============================================================================
   *
   * matchedBeacon은 동일한 비콘이라도
   * RSSI 변경에 따라 주기적으로 갱신될 수 있음.
   */
  useEffect(() => {
    if (!matchedBeacon) {
      console.log('');
      console.log('📭 [BEACON] matchedBeacon = null');

      return;
    }

    const now = Date.now();

    const elapsed = scanStartedAtRef.current
      ? now - scanStartedAtRef.current
      : 0;

    console.log('');
    console.log('========================================');
    console.log('✅ [BEACON DETECTED]');
    console.log('UUID    :', matchedBeacon.uuid);
    console.log('MAJOR   :', matchedBeacon.major);
    console.log('MINOR   :', matchedBeacon.minor);
    console.log('RSSI    :', matchedBeacon.rssi);
    console.log('ELAPSED :', `${elapsed}ms`);
    console.log('TIME    :', new Date(now).toISOString());
    console.log('========================================');
  }, [matchedBeacon]);

  /**
   * ============================================================================
   * Beacon Error 확인
   * ============================================================================
   */
  useEffect(() => {
    if (!error) {
      return;
    }

    const now = Date.now();

    const elapsed = scanStartedAtRef.current
      ? now - scanStartedAtRef.current
      : 0;

    console.log('');
    console.log('========================================');
    console.log('❌ [BEACON ERROR]');
    console.log('ERROR   :', error);
    console.log('ELAPSED :', `${elapsed}ms`);
    console.log('TIME    :', new Date(now).toISOString());
    console.log('========================================');
  }, [error]);

  /**
   * ============================================================================
   * UI 상태
   * ============================================================================
   */
  const tone = TONE_BY_STATUS[status];

  const isDetected = tone === 'detected';

  /**
   * TODO
   * 추후 API 조회 결과로 변경
   */
  const lastAccess = {
    result: 'success' as AccessResult,
    centerName: currentRecord?.WAT_AREA_NAME,
    dateTime: dayjs(currentRecord?.WA_LOG_DATETIME, 'YYYYMMDDHHmmss').format(
      'YYYY-MM-DD HH:mm:ss',
    ),
  };

  return (
    <View style={styles.container}>
      {/* ================================================================
       * 전자 출입증
       * ================================================================ */}

      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Text style={styles.cardTitleText}>전자 출입증</Text>
        </View>

        {/* Beacon Radar */}

        <View style={styles.radarArea}>
          <BeaconRadar tone={tone} />
        </View>

        {/* 출입 버튼 */}

        <LVButton
          disabled={!isDetected}
          title='출입하기'
          onPress={handleSave}
          buttonStyle={{
            width: '85%',
          }}
        />
      </View>

      {/* ================================================================
       * 최근 출입
       * ================================================================ */}
      {!Util.isEmpty(currentRecord) && (
        <LastAccessRecord
          result={lastAccess.result}
          centerName={lastAccess.centerName}
          dateTime={lastAccess.dateTime}
        />
      )}
    </View>
  );
};

export default BeaconAttendanceScreen;

/**
 * ============================================================================
 * Last Access Record
 * ============================================================================
 */

const LastAccessRecord = ({
  result,
  centerName,
  dateTime,
}: LastAccessRecordProps) => {
  const config = ACCESS_RESULT_CONFIG[result];

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animation.setValue(0);

    Animated.spring(animation, {
      toValue: 1,
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [dateTime, animation]);

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1.96, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.lastRecordCard, animatedStyle]}>
      <View
        style={[
          styles.lastRecordIcon,
          {
            backgroundColor: config.backgroundColor,
          },
        ]}
      >
        <Icon name={config.icon} size={18} color={config.color} />
      </View>

      <View style={styles.lastRecordContent}>
        <View style={styles.lastRecordInfo}>
          <Text
            style={[
              styles.lastRecordLabel,
              {
                color: config.color,
              },
            ]}
          >
            {config.label}
          </Text>

          <Text style={styles.lastRecordCenter}>{centerName}</Text>
        </View>

        <View style={styles.lastRecordInfo}>
          <Text style={styles.lastRecordDate}>{dateTime}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * ============================================================================
 * Beacon Radar
 * ============================================================================
 */

const BeaconRadar = ({ tone }: { tone: Tone }) => {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();

    ring1.setValue(0);
    ring2.setValue(0);

    /**
     * 검색 중 상태에서만 pulse animation
     */
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

  /**
   * Pulse Animation Style
   */
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
      {/* ================================================================
       * Searching
       * ================================================================ */}

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
        /* ==============================================================
         * Detected / Problem
         * ============================================================== */

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

      {/* ================================================================
       * Center Icon
       * ================================================================ */}

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

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
  /**
   * Screen
   */

  container: {
    flex: 1,

    width: '100%',

    paddingTop: 16,
    paddingBottom: 24,
  },

  /**
   * --------------------------------------------------------------------------
   * Electronic Pass Card
   * --------------------------------------------------------------------------
   */

  card: {
    marginHorizontal: 30,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    paddingBottom: 24,

    alignItems: 'center',

    borderColor: '#EEF0F3',

    /**
     * iOS
     */
    shadowColor: '#101828',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.06,
    shadowRadius: 18,

    /**
     * Android
     */
    elevation: 3,
  },

  /**
   * Card Header
   */

  cardTitle: {
    width: '100%',

    paddingVertical: 20,

    alignItems: 'center',

    backgroundColor: '#27A7FFCC',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  cardTitleText: {
    fontSize: 20,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  /**
   * --------------------------------------------------------------------------
   * Radar
   * --------------------------------------------------------------------------
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

    /**
     * iOS
     */
    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,
    shadowRadius: 8,

    /**
     * Android
     */
    elevation: 2,
  },

  /**
   * --------------------------------------------------------------------------
   * Last Access Record
   * --------------------------------------------------------------------------
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
  },

  lastRecordContent: {
    flex: 1,

    marginLeft: 12,
  },

  lastRecordInfo: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRecordLabel: {
    marginBottom: 4,

    fontSize: 12,

    fontWeight: '600',
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
});
