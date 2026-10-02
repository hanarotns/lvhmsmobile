// 사무실에 설치한 실제 비콘 장비(기기명 MBeacon)의 식별자.
export const TARGET_BEACON_UUID = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';

// major/minor는 undefined면 매칭에서 건너뛴다(와일드카드).
// 1차 작업의 목적이 "수신한 major/minor를 화면에 보여주는 것"이라
// 필터 조건에 넣으면 화면 값이 상수를 되비추는 것에 불과해진다.
// 우리 비콘 식별은 UUID로만 하고, 실제 수신값을 그대로 표시한다.
// 비콘이 여러 대로 늘어나 구분이 필요해지면 그때 되살린다.
export const TARGET_MAJOR: number | undefined = undefined;
export const TARGET_MINOR: number | undefined = undefined;

export const APPLE_COMPANY_ID = 0x004c;
export const IBEACON_TYPE = 0x02;
export const IBEACON_DATA_LENGTH = 0x15;
