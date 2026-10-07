import CoreLocation
import ExpoModulesCore

// iOS는 CoreBluetooth 스캔 결과에서 iBeacon 광고를 제거하므로
// (react-native-ble-plx로는 절대 수신 불가) CoreLocation ranging으로 받는다.
public class ExpoBeaconModule: Module {
  private var locationManager: CLLocationManager?
  private var delegate: BeaconLocationDelegate?
  private var pendingAuthorizationPromises: [Promise] = []

  public func definition() -> ModuleDefinition {
    Name("ExpoBeacon")

    Events("onBeacons", "onError")

    OnCreate {
      DispatchQueue.main.async {
        self.setUpManagerIfNeeded()
      }
    }

    OnDestroy {
      DispatchQueue.main.async {
        self.stopAllRanging()
      }
    }

    // 위치 권한(사용하는 동안). 아직 결정 전이면 시스템 팝업 응답까지 기다린다.
    AsyncFunction("requestAuthorization") { (promise: Promise) in
      let manager = self.setUpManagerIfNeeded()
      let status = manager.authorizationStatus
      if status == .notDetermined {
        self.pendingAuthorizationPromises.append(promise)
        manager.requestWhenInUseAuthorization()
      } else {
        promise.resolve(Self.authorizationString(status))
      }
    }.runOnQueue(.main)

    Function("isRangingAvailable") { () -> Bool in
      return CLLocationManager.isRangingAvailable()
    }

    Function("startRanging") { (uuidString: String) in
      guard let uuid = UUID(uuidString: uuidString) else {
        self.sendEvent("onError", ["message": "Invalid beacon UUID: \(uuidString)"])
        return
      }
      DispatchQueue.main.async {
        let manager = self.setUpManagerIfNeeded()
        manager.startRangingBeacons(satisfying: CLBeaconIdentityConstraint(uuid: uuid))
      }
    }

    Function("stopRanging") {
      DispatchQueue.main.async {
        self.stopAllRanging()
      }
    }
  }

  @discardableResult
  private func setUpManagerIfNeeded() -> CLLocationManager {
    if let manager = locationManager {
      return manager
    }
    let manager = CLLocationManager()
    let delegate = BeaconLocationDelegate(module: self)
    manager.delegate = delegate
    self.locationManager = manager
    self.delegate = delegate
    return manager
  }

  private func stopAllRanging() {
    guard let manager = locationManager else { return }
    for constraint in manager.rangedBeaconConstraints {
      manager.stopRangingBeacons(satisfying: constraint)
    }
  }

  fileprivate func handleAuthorizationChange(_ status: CLAuthorizationStatus) {
    // 매니저 생성 직후에도 현재 상태로 한 번 호출된다. 결정 전이면 무시.
    if status == .notDetermined { return }
    let result = Self.authorizationString(status)
    let promises = pendingAuthorizationPromises
    pendingAuthorizationPromises.removeAll()
    for promise in promises {
      promise.resolve(result)
    }
  }

  fileprivate func handleRanged(_ beacons: [CLBeacon]) {
    let payload: [[String: Any]] = beacons.map { beacon in
      [
        "uuid": beacon.uuid.uuidString,
        "major": beacon.major.intValue,
        "minor": beacon.minor.intValue,
        "rssi": beacon.rssi,
        "proximity": Self.proximityString(beacon.proximity),
        "accuracy": beacon.accuracy,
      ]
    }
    sendEvent("onBeacons", ["beacons": payload])
  }

  fileprivate func handleRangingError(_ error: Error) {
    sendEvent("onError", ["message": error.localizedDescription])
  }

  private static func authorizationString(_ status: CLAuthorizationStatus) -> String {
    switch status {
    case .authorizedAlways, .authorizedWhenInUse:
      return "granted"
    case .restricted:
      return "restricted"
    default:
      return "denied"
    }
  }

  private static func proximityString(_ proximity: CLProximity) -> String {
    switch proximity {
    case .immediate: return "immediate"
    case .near: return "near"
    case .far: return "far"
    default: return "unknown"
    }
  }
}

// Module은 NSObject가 아니므로 delegate를 별도 객체로 둔다.
private class BeaconLocationDelegate: NSObject, CLLocationManagerDelegate {
  weak var module: ExpoBeaconModule?

  init(module: ExpoBeaconModule) {
    self.module = module
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    module?.handleAuthorizationChange(manager.authorizationStatus)
  }

  func locationManager(
    _ manager: CLLocationManager,
    didRange beacons: [CLBeacon],
    satisfying beaconConstraint: CLBeaconIdentityConstraint
  ) {
    module?.handleRanged(beacons)
  }

  func locationManager(
    _ manager: CLLocationManager,
    didFailRangingFor beaconConstraint: CLBeaconIdentityConstraint,
    error: Error
  ) {
    module?.handleRangingError(error)
  }
}
