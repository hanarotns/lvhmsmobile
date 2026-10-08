import { NativeModule, requireOptionalNativeModule } from 'expo';

export type BeaconAuthorization = 'granted' | 'denied' | 'restricted';

export type RangedBeacon = {
  uuid: string;
  major: number;
  minor: number;
  // 0이면 이번 주기에 신호를 못 받은 것(proximity unknown).
  rssi: number;
  proximity: 'immediate' | 'near' | 'far' | 'unknown';
  accuracy: number;
};

type ExpoBeaconEvents = {
  onBeacons: (event: { beacons: RangedBeacon[] }) => void;
  onError: (event: { message: string }) => void;
};

declare class ExpoBeaconModule extends NativeModule<ExpoBeaconEvents> {
  requestAuthorization(): Promise<BeaconAuthorization>;
  isRangingAvailable(): boolean;
  startRanging(uuid: string): void;
  stopRanging(): void;
}

// iOS 전용 모듈. 안드로이드에서는 null.
export default requireOptionalNativeModule<ExpoBeaconModule>('ExpoBeacon');
