import Text from '@/src/components/CustomText'; // 공통컴포넌트
import Icon from '@/src/components/Icon'; // 공통컴포넌트
import LVStyles from '@/src/components/LVStyles';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const LVChip = (props: any) => {
  const { category } = props;

  if (category === 'apprStatus') {
    const { title, code, settingOfStyle: customStyle } = props;
    let settingOfStyle = {
      backgroundColor: {
        W: '#93D3FF', // 대기
        S: '#27A7FF', // 진행중
        A: '#939DAA', // 결재완료
        R: '#FF9294', // 반려됨
        C: '#6A727B', // 취소됨
      },
    };
    if (customStyle) {
      settingOfStyle = customStyle;
    }

    return (
      <View
        style={[
          LVStyles.row,
          {
            paddingVertical: 3,
            paddingLeft: 8,
            paddingRight: 12,
            backgroundColor: settingOfStyle.backgroundColor[code] || 'black',
            borderRadius: 12,
          },
        ]}
      >
        <Text
          style={{
            marginLeft: 4,
            fontWeight: '700',
            fontSize: 12,
            color: '#FFF',
          }}
        >
          {title}
        </Text>
      </View>
    );
  } else if (category === 'type') {
    const { content, chipStyle, textStyle, subContent } = props;
    return (
      <View
        style={[
          {
            borderColor: '#6A727B',
            borderWidth: 1,
            padding: 8,
            borderRadius: 24,
            margin: 2,
            justifyContent: 'center',
            alignItems: 'center',
            ...chipStyle,
          },
        ]}
      >
        <Text
          style={{
            color: '#6A727B',
            fontWeight: '700',
            fontSize: 14,
            ...textStyle,
          }}
        >
          {content}
        </Text>
        {subContent ? (
          <View
            style={{
              position: 'absolute',
              top: -10,
              left: -12,
              borderColor: '#27A7FF',
              backgroundColor: '#FFF',
              borderWidth: 1,
              borderRadius: 24,
              padding: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#27A7FF',
              }}
            >
              {subContent}
            </Text>
          </View>
        ) : (
          <></>
        )}
      </View>
    );
  } else if (category === 'info') {
    const { leftText, rightText, onPress, chipStyle, i } = props;
    return (
      <View
        key={i}
        style={[
          LVStyles.row,
          {
            borderColor: '#39CCCC',
            borderWidth: 1,
            padding: 4,
            paddingHorizontal: 12,
            borderRadius: 24,
            backgroundColor: '#EFFBFB',
            minWidth: 200,
            ...chipStyle,
          },
        ]}
      >
        <Text
          style={{
            color: '#39CCCC',
            fontWeight: '700',
            fontSize: 14,
          }}
        >
          {leftText}
        </Text>
        <Text
          style={{
            color: '#39CCCC',
            fontWeight: '700',
            fontSize: 14,
            marginLeft: 8,
          }}
        >
          {rightText}
        </Text>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Icon
              name={'close-outline'}
              fill={'#39CCCC'}
              style={[LVStyles.iconS]}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  } else if (category === 'apprLineFlag') {
    const { title } = props;
    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#27A7FF',
          paddingVertical: 5,
          width: 64,
          height: 30,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontWeight: '600',
            color: '#27A7FF',
            fontSize: 14,
          }}
        >
          {title}
        </Text>
      </View>
    );
  } else if (category === 'otReqType') {
    const { code, mainColor } = props;
    return (
      <View
        style={[
          LVStyles.row,
          {
            paddingVertical: 3,
            paddingLeft: 8,
            paddingRight: 12,
            borderColor: mainColor,
            borderWidth: 1,
            borderRadius: 12,
          },
        ]}
      >
        <Text
          style={{
            marginLeft: 4,
            fontWeight: '700',
            fontSize: 12,
            color: mainColor,
          }}
        >
          {code == 'ES' ? `예정` : `확정`}
        </Text>
      </View>
    );
  } else if (category === 'confirmStatus') {
    const { title, code, settingOfStyle: customStyle } = props;
    let settingOfStyle = {
      backgroundColor: {
        P: '#93D3FF', // 대기
        S: '#27A7FF', // 승인
        R: '#FF9294', // 반려
      },
    };
    if (customStyle) {
      settingOfStyle = customStyle;
    }

    return (
      <View
        style={[
          LVStyles.row,
          {
            paddingVertical: 3,
            paddingLeft: 8,
            paddingRight: 12,
            backgroundColor: settingOfStyle.backgroundColor[code] || 'black',
            borderRadius: 12,
          },
        ]}
      >
        <Text
          style={{
            marginLeft: 4,
            fontWeight: '700',
            fontSize: 12,
            color: '#FFF',
          }}
        >
          {title}
        </Text>
      </View>
    );
  } else {
    const { date, type } = props;
    return (
      <View style={{ flex: 1 }}>
        <View
          style={[
            LVStyles.row,
            {
              borderColor: '#39CCCC',
              borderWidth: 1,
              padding: 12,
              borderRadius: 24,
              width: '50%',
              backgroundColor: '#EFFBFB',
            },
          ]}
        >
          <Text
            style={{
              color: '#39CCCC',
              fontWeight: '700',
              fontSize: 14,
            }}
          >
            {date}
          </Text>
          <Text
            style={{
              color: '#39CCCC',
              fontWeight: '700',
              fontSize: 14,
            }}
          >
            {type}
          </Text>
        </View>
      </View>
    );
  }
};
export default LVChip;

const styles = StyleSheet.create({});
