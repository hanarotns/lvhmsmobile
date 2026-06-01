import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useEmpStore } from '@/src/stores/empStore';
import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';

import {
  KeyboardAwareScrollView,
  LVButton,
  LVCheckBox,
  LVLoadingIndicator,
  LVStyles,
  SafeAreaView,
  TermsOfPiece,
  Text,
} from '@/src/components';
import { Util } from '@/src/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import 'dayjs/locale/ko';

const SGN010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);

  const [isCheck1, setIsCheck1] = useState(false);
  const [isCheck2, setIsCheck2] = useState(false);
  const [isCheck3, setIsCheck3] = useState(false);
  const [isCheck4, setIsCheck4] = useState(false);
  const [visibleTerms, setVisibleTerms] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(false);
  };

  const onConfirm = (value) => {
    setCategory(value);
    setVisibleTerms(!visibleTerms);
  };

  return (
    <SafeAreaView edges={['bottom']} style={LVStyles.safeAreaView}>
      <View style={{ flex: 1, paddingTop: 20 }}>
        <KeyboardAwareScrollView>
          <View>
            {[
              {
                label: '[필수] 이용약관',
                checked: isCheck1,
                setChecked: setIsCheck1,
                category: 'UT',
              },
              // {
              //   label: '[선택] 실명 인증된 아이디로 가입',
              //   onChange: setIsCheck2,
              // },
              // {
              //   label: '[선택] 위치기반서비스 이용약관',
              //   onChange: setIsCheck3,
              //   category: 'LT',
              // },
              {
                label: '[필수] 개인정보 수집 및 이용',
                checked: isCheck4,
                setChecked: setIsCheck4,
                category: 'PT',
              },
            ].map((e: any) => (
              <TouchableOpacity
                onPress={() => {
                  onConfirm(e?.category);
                }}
                style={styles.termView}
              >
                <LVCheckBox value={e?.checked} onChange={e?.setChecked} />
                <View style={{ width: 8 }} />
                <Text
                  style={{ fontSize: 20, color: '#373747', fontWeight: '500' }}
                >
                  {e?.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </KeyboardAwareScrollView>
        <View style={LVStyles.bottomButtonView}>
          <LVButton
            title={'다음'}
            onPress={() => {
              if (isCheck1 && isCheck4) {
                movingScreen.navigate('SGN010201', {
                  UT: isCheck1,
                  // LT: isCheck2,
                  PT: isCheck4,
                });
              } else {
                Util.toastMsg('필수 약관에 동의하세요.', 'info');
              }
            }}
            buttonStyle={{
              flex: 1,
              backgroundColor: isCheck1 && isCheck4 ? '#27A7FF' : 'lightgrey',
            }}
          />
        </View>
      </View>
      {visibleTerms && (
        <View style={styles.modalTermView}>
          <TermsOfPiece category={category} onConfirm={onConfirm} />
        </View>
      )}
      {loading && <LVLoadingIndicator />}
    </SafeAreaView>
  );
};
export default SGN010101;

const styles = StyleSheet.create({
  termView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  modalTermView: {
    marginHorizontal: 20,
    marginBottom: 60,
  },
});
