import type { Permission } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';

// 사람이 다이얼로그를 보고 누르는 데 이보다 짧게 걸릴 수는 없다.
// 이보다 빨리 거부로 반환됐다면 UI가 뜨지 않았다는 뜻이다.
const HUMAN_RESPONSE_FLOOR_MS = 1000;
const RETRY_DELAY_MS = 2000;

const getRequiredPermissions = (): Permission[] =>
  Number(Platform.Version) >= 31
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

// 화면이 다시 마운트되면 요청이 중복으로 나간다. 진행 중인 요청을 공유해서
// 같은 Activity에 권한 요청이 두 번 걸리지 않게 한다.
let inFlight: Promise<boolean> | null = null;

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  if (!inFlight) {
    inFlight = resolvePermissions().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function resolvePermissions(): Promise<boolean> {
  const permissions = getRequiredPermissions();

  // 이미 허용돼 있으면 요청 자체를 하지 않는다.
  // 요청을 걸 때마다 다른 권한 요청과 충돌할 여지가 생기므로 최소화한다.
  const checked = await Promise.all(
    permissions.map((permission) => PermissionsAndroid.check(permission)),
  );
  if (checked.every(Boolean)) {
    return true;
  }

  const first = await requestOnce(permissions);
  if (first.granted) {
    return true;
  }

  // 안드로이드는 한 Activity에 권한 요청이 겹치면 먼저 뜬 다이얼로그를 취소하고
  // 즉시 거부(never_ask_again)로 응답한다. 이 화면은 expo-location 권한 요청
  // (MYH010101의 checkAboutLocation)을 거의 동시에 돌리기 때문에 첫 요청이
  // 이렇게 잡아먹힐 수 있다. 사용자가 실제로 거부한 게 아니라 UI 자체가
  // 뜨지 않은 경우에만 한 번 더 시도한다.
  if (!first.dismissedWithoutUi) {
    return false;
  }

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  const second = await requestOnce(permissions);
  return second.granted;
}

async function requestOnce(permissions: Permission[]) {
  const startedAt = Date.now();
  const results = await PermissionsAndroid.requestMultiple(permissions);
  const elapsed = Date.now() - startedAt;

  const granted = permissions.every(
    (permission) => results[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );

  return {
    granted,
    dismissedWithoutUi: !granted && elapsed < HUMAN_RESPONSE_FLOOR_MS,
  };
}
