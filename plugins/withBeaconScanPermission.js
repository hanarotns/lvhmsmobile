const { withAndroidManifest } = require('expo/config-plugins');

// react-native-ble-plx의 라이브러리 매니페스트가 BLUETOOTH_SCAN에
// android:usesPermissionFlags="neverForLocation"을 선언한다. 이 플래그가 병합되면
// 안드로이드가 "위치 용도로 스캔하지 않는 앱"으로 간주해 iBeacon 광고를
// 스캔 결과에서 걸러내므로(BtGatt.GattService: Skipping data matching denylist),
// tools:remove로 병합 단계에서 해당 속성을 제거한다.
module.exports = function withBeaconScanPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const permissions = manifest['uses-permission'] ?? [];
    const name = 'android.permission.BLUETOOTH_SCAN';
    let scanPermission = permissions.find((item) => item.$['android:name'] === name);

    if (!scanPermission) {
      scanPermission = { $: { 'android:name': name } };
      permissions.push(scanPermission);
    }

    delete scanPermission.$['android:usesPermissionFlags'];
    scanPermission.$['tools:remove'] = 'android:usesPermissionFlags';

    manifest['uses-permission'] = permissions;
    return config;
  });
};
