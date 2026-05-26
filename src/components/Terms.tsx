import * as icon from '@/src/assets/images';
import Text from '@/src/components/CustomText';
import { Divider } from '@ui-kitten/components';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import termContent from './termContent';

const CheckNText = ({ label, checked }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <TouchableOpacity onPress={() => {}}>
        <Image
          source={
            checked ? icon.ico_checkbox02_check : icon.ico_checkbox02_empty
          }
          resizeMode={'contain'}
          style={{
            width: 28,
            height: 28,
          }}
        />
      </TouchableOpacity>
      <View style={{ width: 8 }} />
      <Text
        style={{
          color: '#000000',
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const Terms = ({ onConfirm }) => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 40,
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          color: '#1E2125',
          fontSize: 20,
          fontWeight: '600',
          alignSelf: 'flex-start',
        }}
      >
        약관동의
      </Text>
      <View style={{ height: 16 }} />
      <View
        style={{
          height: '100%',
          width: '100%',
          borderColor: '#CDD3D8',
          borderWidth: 1,
          borderRadius: 8,
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            marginTop: 24,
            marginHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            이용약관
          </Text>
          <Divider style={{ backgroundColor: 'gray' }} />
          <Text>{termContent('UT', 'N')}</Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            개인정보이용
          </Text>
          <Divider style={{ backgroundColor: 'gray' }} />
          <Text>{termContent('PT', 'N')}</Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            위치기반서비스이용 동의
          </Text>
          <Divider style={{ backgroundColor: 'gray' }} />
          <Text>{termContent('LT', 'N')}</Text>
        </ScrollView>
        {/* 나중에 마저 구현 */}
        {/* <View
            style={{
              height: 184, 
              backgroundColor: '#F0F1F2',
              paddingTop: 24, 
              paddingHorizontal: 16, 
            }}
          >
            <CheckNText label={'전체동의'} checked={true} />
            <View
              style={{
                paddingLeft: 8, 
              }}
            >
              <CheckNText label={'[필수] 이용약관에 동의'} />
              <CheckNText label={'[필수] 개인정보이용에 동의'} />
              <CheckNText label={'[필수] 위치기반서비스이용에 동의'} />
            </View>
          </View> */}
        <TouchableOpacity
          style={{
            height: 48,
            backgroundColor: '#999FA8',
            borderBottomStartRadius: 8,
            borderBottomEndRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            onConfirm();
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: '700',
            }}
          >
            확인
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Terms;
