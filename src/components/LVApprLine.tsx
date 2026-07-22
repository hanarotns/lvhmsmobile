import * as icon from '@/src/assets/images';
import Text from '@/src/components/CustomText';
import LVStyles from '@/src/components/LVStyles';
import util from '@/src/lib/util';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LVColors from './LVColors';

const LVApprLine = (props: any) => {
  const { data, mainColor, style, reqApproval } = props;
  return (
    <View
      style={[
        LVStyles.row,
        {
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          ...style,
          flex: 1,
        },
      ]}
    >
      {data?.map((e: any, i: number) => {
        return (
          <View key={i} style={styles.container}>
            <View style={{ flex: 1 }}>
              {/* 결재타입 */}
              <View style={styles.centerView}>
                {e?.AP_TYPE_NAME ? (
                  <View style={styles.apTypeNameView}>
                    <Text style={styles.apTypeNameText}>{e?.AP_TYPE_NAME}</Text>
                  </View>
                ) : (
                  <></>
                )}
              </View>
              {/* 결재자 이름, 화살표*/}
              <View style={styles.centerView}>
                <Text
                  style={{
                    color: util.isEmpty(e?.CONFIRM_DATE)
                      ? '#373747'
                      : mainColor,
                    fontWeight: '700',
                    fontSize: 14,
                  }}
                >
                  {e?.NAME_LOC || e?.AP_EMP_NAME || e?.APPROVAL_EMP_NAME}
                </Text>
              </View>
              {/* 결재 시간 */}
              {e?.JOB_NO && !reqApproval ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.dateTime}>
                    {e?.CONFIRM_DATE.substring(2, 10)}
                  </Text>
                  <Text style={styles.dateTime}>
                    {e?.CONFIRM_DATE.substring(11, 16)}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>

            <View style={{ justifyContent: 'center' }}>
              {i !== data.length - 1 ? (
                <Image
                  source={icon.ico_arrow_right_full}
                  style={[
                    LVStyles.iconS,
                    {
                      tintColor: util.isEmpty(e?.CONFIRM_DATE)
                        ? '#373747'
                        : mainColor,
                    },
                  ]}
                />
              ) : (
                <View style={{ width: 24 }} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
export default LVApprLine;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '33%',
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  apTypeNameView: {
    borderColor: LVColors.border,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 24,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apTypeNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: LVColors.subText,
  },
  dateTime: {
    color: '#ABBACD',
    fontWeight: '700',
    fontSize: 12,
  },
});
