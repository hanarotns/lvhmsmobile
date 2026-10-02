import { BleManager } from 'react-native-ble-plx';

// 앱 전체에서 하나만 존재해야 하므로 싱글턴으로 export.
export const bleManager = new BleManager();
