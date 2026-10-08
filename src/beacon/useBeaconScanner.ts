import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { State } from 'react-native-ble-plx';

import ExpoBeacon from '@/modules/expo-beacon';

import { bleManager } from './bleManager';
import { TARGET_BEACON_UUID, TARGET_MAJOR, TARGET_MINOR } from './constants';
import { findIBeaconInRawScanRecord, parseIBeacon } from './parseIBeacon';
import { requestBlePermissions } from './permissions';

export type BeaconScanStatus =
  | 'idle'
  | 'requesting-permission'
  | 'permission-denied'
  | 'bluetooth-off'
  | 'scanning'
  | 'detected'
  | 'error';

export type MatchedBeacon = {
  uuid: string;
  major: number;
  minor: number;
  rssi: number | null;
};

// 스캔 콜백은 광고 패킷마다(초당 수~수십 회) 호출된다. 표시 목적이라 1초면 충분.
const EMIT_INTERVAL_MS = 1000;
// 마지막 수신 이후 이만큼 지나면 비콘이 범위를 벗어난 것으로 보고 '찾는 중'으로 되돌린다.
const STALE_TIMEOUT_MS = 10000;
const STALE_CHECK_INTERVAL_MS = 1000;

function matchesTarget(beacon: { uuid: string; major: number; minor: number }) {
  if (beacon.uuid.toLowerCase() !== TARGET_BEACON_UUID.toLowerCase()) {
    return false;
  }
  if (TARGET_MAJOR !== undefined && beacon.major !== TARGET_MAJOR) {
    return false;
  }
  if (TARGET_MINOR !== undefined && beacon.minor !== TARGET_MINOR) {
    return false;
  }
  return true;
}

export function useBeaconScanner() {
  const [status, setStatus] = useState<BeaconScanStatus>('idle');
  const [matchedBeacon, setMatchedBeacon] = useState<MatchedBeacon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isScanningRef = useRef(false);
  // 사용자/화면이 원하는 상태. 블루투스가 꺼졌다 켜졌을 때 재개할지 판단하는 기준.
  const wantScanRef = useRef(false);
  const lastEmitAtRef = useRef(0);
  const lastSeenAtRef = useRef(0);
  const staleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // iOS ranging 이벤트 구독 (안드로이드에서는 비어 있음)
  const rangingSubsRef = useRef<{ remove: () => void }[]>([]);

  const clearStaleTimer = useCallback(() => {
    if (staleTimerRef.current) {
      clearInterval(staleTimerRef.current);
      staleTimerRef.current = null;
    }
  }, []);

  /**
   * 실제 BLE 스캔만 중지. (원하는 상태 wantScanRef는 건드리지 않음)
   */
  const stopRawScan = useCallback(() => {
    if (isScanningRef.current) {
      if (Platform.OS === 'ios') {
        ExpoBeacon?.stopRanging();
        rangingSubsRef.current.forEach((sub) => sub.remove());
        rangingSubsRef.current = [];
      } else {
        bleManager.stopDeviceScan();
      }
      isScanningRef.current = false;
    }
    clearStaleTimer();
    lastEmitAtRef.current = 0;
    lastSeenAtRef.current = 0;
  }, [clearStaleTimer]);

  const failScan = useCallback(
    (message: string) => {
      stopRawScan();
      setError(message);
      setStatus('error');
    },
    [stopRawScan],
  );

  /**
   * 우리 비콘 1건 수신 처리 (플랫폼 공통). 스로틀 후 화면 상태 갱신.
   */
  const reportBeacon = useCallback(
    (beacon: { uuid: string; major: number; minor: number }, rssi: number | null) => {
      const now = Date.now();
      lastSeenAtRef.current = now;
      if (now - lastEmitAtRef.current < EMIT_INTERVAL_MS) return;
      lastEmitAtRef.current = now;

      setMatchedBeacon({
        uuid: beacon.uuid,
        major: beacon.major,
        minor: beacon.minor,
        rssi,
      });
      setStatus('detected');
    },
    [],
  );

  /**
   * 안드로이드: BLE 광고 패킷을 직접 받아 iBeacon을 파싱한다.
   */
  const startAndroidScan = useCallback(() => {
    // iBeacon은 서비스 UUID로 광고하지 않으므로 필터를 걸면 안 잡힌다.
    // 서비스 UUID 필터와 ScanOptions를 모두 null로 두고 JS단에서 걸러낸다.
    bleManager.startDeviceScan(
      null,
      null,
      (scanError, device: Device | null) => {
        if (scanError) {
          failScan(scanError.message);
          return;
        }
        if (!device) return;

        // 안드로이드는 회사ID가 같은 Manufacturer Data 구조체가 패킷에 여러 개 있으면
        // manufacturerData가 그중 하나만 반환하므로, rawScanRecord를 우선 사용.
        const beacon =
          findIBeaconInRawScanRecord(device.rawScanRecord) ??
          parseIBeacon(device.manufacturerData);
        if (!beacon || !matchesTarget(beacon)) return;

        reportBeacon(beacon, device.rssi);
      },
    );
  }, [failScan, reportBeacon]);

  /**
   * iOS: CoreBluetooth는 iBeacon 광고를 걸러내므로 CoreLocation ranging을 쓴다.
   * OS가 약 1초마다 해당 UUID 비콘 목록을 넘겨준다.
   */
  const startIosRanging = useCallback(() => {
    if (!ExpoBeacon || !ExpoBeacon.isRangingAvailable()) {
      failScan('이 기기는 비콘 감지를 지원하지 않습니다.');
      return;
    }

    rangingSubsRef.current = [
      ExpoBeacon.addListener('onBeacons', ({ beacons }) => {
        // rssi 0은 이번 주기에 신호를 못 받은 비콘(proximity unknown)이다.
        const strongest = beacons
          .filter((beacon) => beacon.rssi !== 0 && matchesTarget(beacon))
          .sort((a, b) => b.rssi - a.rssi)[0];
        if (!strongest) return;

        reportBeacon(strongest, strongest.rssi);
      }),
      ExpoBeacon.addListener('onError', ({ message }) => {
        failScan(message);
      }),
    ];
    ExpoBeacon.startRanging(TARGET_BEACON_UUID);
  }, [failScan, reportBeacon]);

  /**
   * 권한/블루투스 확인을 마친 뒤 실제 스캔을 시작.
   */
  const beginScan = useCallback(() => {
    if (isScanningRef.current) return;

    setStatus('scanning');
    setMatchedBeacon(null);
    isScanningRef.current = true;
    lastEmitAtRef.current = 0;
    lastSeenAtRef.current = 0;

    if (Platform.OS === 'ios') {
      startIosRanging();
    } else {
      startAndroidScan();
    }
    if (!isScanningRef.current) return;

    clearStaleTimer();
    staleTimerRef.current = setInterval(() => {
      if (!lastSeenAtRef.current) return;
      if (Date.now() - lastSeenAtRef.current < STALE_TIMEOUT_MS) return;
      // 비콘이 사라졌다. 다시 잡히면 즉시 반영되도록 스로틀도 초기화.
      lastSeenAtRef.current = 0;
      lastEmitAtRef.current = 0;
      setMatchedBeacon(null);
      setStatus((current) => (current === 'detected' ? 'scanning' : current));
    }, STALE_CHECK_INTERVAL_MS);
  }, [clearStaleTimer, startAndroidScan, startIosRanging]);

  const stopScan = useCallback(() => {
    wantScanRef.current = false;
    stopRawScan();
    setStatus((current) =>
      current === 'scanning' || current === 'detected' ? 'idle' : current,
    );
    setMatchedBeacon(null);
  }, [stopRawScan]);

  const startScan = useCallback(async () => {
    wantScanRef.current = true;
    setError(null);
    setMatchedBeacon(null);

    setStatus('requesting-permission');
    const granted = await requestBlePermissions();
    if (!granted) {
      setStatus('permission-denied');
      return;
    }
    // 권한 대기 중에 화면을 벗어났을 수 있다.
    if (!wantScanRef.current) return;

    const btState = await bleManager.state();
    if (btState !== State.PoweredOn) {
      setStatus('bluetooth-off');
      return;
    }

    beginScan();
  }, [beginScan]);

  // 블루투스를 껐다 켜는 경우를 따라가기 위한 구독.
  // 일회성 확인만 하면 사용자가 스캔 중 BT를 토글했을 때 복구되지 않는다.
  useEffect(() => {
    const subscription = bleManager.onStateChange((btState) => {
      if (!wantScanRef.current) return;

      if (btState === State.PoweredOn) {
        beginScan();
      } else {
        stopRawScan();
        setStatus('bluetooth-off');
        setMatchedBeacon(null);
      }
    }, false);

    return () => {
      subscription.remove();
    };
  }, [beginScan, stopRawScan]);

  useEffect(() => {
    return () => {
      wantScanRef.current = false;
      stopRawScan();
    };
  }, [stopRawScan]);

  return { status, matchedBeacon, error, startScan, stopScan };
}
