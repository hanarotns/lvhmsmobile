import { toByteArray } from 'base64-js';

import { APPLE_COMPANY_ID, IBEACON_DATA_LENGTH, IBEACON_TYPE } from './constants';

export type ParsedIBeacon = {
  uuid: string;
  major: number;
  minor: number;
  txPower: number;
};

const MANUFACTURER_SPECIFIC_DATA_AD_TYPE = 0xff;
// 페이로드(회사ID 이후)는 2바이트 Company ID + 1바이트 iBeacon 타입 +
// 1바이트 길이 + 16바이트 UUID + 2바이트 Major + 2바이트 Minor + 1바이트 TxPower 순서.
const IBEACON_PAYLOAD_LENGTH = 25;

// 안드로이드는 광고 패킷에 회사ID가 같은 Manufacturer Data AD 구조체가 2개 이상 있으면
// (예: 아이폰이 iBeacon과 다른 Apple Continuity 신호를 같은 패킷에 함께 실어 보내는 경우)
// react-native-ble-plx의 manufacturerData가 그중 하나만(잘못된 것일 수 있음) 반환한다.
// rawScanRecord(가공되지 않은 원본 패킷)를 직접 순회해서 모든 0xFF 구조체를 확인해야 안전하다.
export function findIBeaconInRawScanRecord(rawScanRecordBase64: string | null | undefined): ParsedIBeacon | null {
  if (!rawScanRecordBase64) {
    return null;
  }

  let bytes: Uint8Array;
  try {
    bytes = toByteArray(rawScanRecordBase64);
  } catch {
    return null;
  }

  let index = 0;
  while (index < bytes.length) {
    const structureLength = bytes[index];
    if (structureLength === 0) {
      break;
    }
    const type = bytes[index + 1];
    const dataStart = index + 2;
    const dataEnd = index + 1 + structureLength;
    if (dataEnd > bytes.length) {
      break;
    }

    if (type === MANUFACTURER_SPECIFIC_DATA_AD_TYPE) {
      const beacon = parseIBeaconPayload(bytes.slice(dataStart, dataEnd));
      if (beacon) {
        return beacon;
      }
    }

    index = dataEnd;
  }

  return null;
}

export function parseIBeacon(manufacturerDataBase64: string | null | undefined): ParsedIBeacon | null {
  if (!manufacturerDataBase64) {
    return null;
  }

  let bytes: Uint8Array;
  try {
    bytes = toByteArray(manufacturerDataBase64);
  } catch {
    return null;
  }

  return parseIBeaconPayload(bytes);
}

function parseIBeaconPayload(bytes: Uint8Array): ParsedIBeacon | null {
  if (bytes.length < IBEACON_PAYLOAD_LENGTH) {
    return null;
  }

  const companyId = bytes[0] | (bytes[1] << 8);
  if (companyId !== APPLE_COMPANY_ID) {
    return null;
  }
  if (bytes[2] !== IBEACON_TYPE || bytes[3] !== IBEACON_DATA_LENGTH) {
    return null;
  }

  const uuidBytes = bytes.slice(4, 20);
  const uuid = formatUuid(uuidBytes);
  const major = (bytes[20] << 8) | bytes[21];
  const minor = (bytes[22] << 8) | bytes[23];
  const txPower = toSignedByte(bytes[24]);

  return { uuid, major, minor, txPower };
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function toSignedByte(byte: number): number {
  return byte > 127 ? byte - 256 : byte;
}
