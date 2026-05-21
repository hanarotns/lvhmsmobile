import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import Text from '@/src/components/CustomText';
import termContent from './termContent';
// import RNRestart from 'react-native-restart'; // Import package from node modules
import { Divider } from '@ui-kitten/components';
import { ScrollView } from 'react-native-gesture-handler';

const TermsPiece = ({ category, onConfirm }) => {
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
            {category === 'UT' && <Text>이용약관</Text>}
            {category === 'PT' && <Text>개인정보이용</Text>}
            {category === 'LT' && <Text>위치기반서비스이용 동의</Text>}
          </Text>

          <Divider style={{ backgroundColor: 'gray' }} />
          {category === 'UT' && <Text>{termContent('UT', 'N')}</Text>}
          {category === 'PT' && <Text>{termContent('PT', 'N')}</Text>}
          {category === 'LT' && <Text>{termContent('LT', 'N')}</Text>}
        </ScrollView>
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

export default TermsPiece;
