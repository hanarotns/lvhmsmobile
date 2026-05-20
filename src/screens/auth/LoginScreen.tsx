import { LVButton, LVStyles } from '@/src/components';
import React from 'react';
import { Button, Image, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as icon from '../../assets/images';

export default function LoginScreen({ navigation }) {
  const signIn = () => {};
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <KeyboardAwareScrollView
          style={{ marginTop: 158, marginHorizontal: 20 }}
        >
          <Image
            source={icon.ico_logo_lvhms}
            resizeMode={'contain'}
            style={styles.logobox}
          />
          <LVButton
            title={'로그인'}
            onPress={signIn}
            buttonStyle={{ backgroundColor: '#27A7FF' }}
          />

          <View style={LVStyles.row}>
            <Button
              title='비밀번호변경'
              onPress={() => {
                navigation.navigate('SignUp');
              }}
            />
            <Button
              title='회원가입'
              onPress={() => {
                navigation.navigate('SignUp');
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  autoLogin: {
    marginRight: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
    marginTop: 15,
  },
  indicator: {
    flex: 1,
    backgroundColor: '#28304C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 2.5,
    height: 50,
    width: 100,
  },
  buttonBox: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logobox: {
    width: 197,
    height: 59,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginbox: {
    padding: 5,
  },
  container: {
    margin: 50,
    padding: 5,
    flex: 1,
    flexDirection: 'column',
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: '#F0F2F6',
  },
  textFieldSt: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#27A7FF17',
    borderColor: '#27A7FF',
    borderRadius: 8,
  },
  inputIdContainer: {
    width: '70%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonLogin: {
    width: '100%',
    height: 50,
    backgroundColor: '#27A7FF',
    // bluecolor.basicWhiteColorTrans,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    // bluecolor.basicBlueFontColor,
    fontWeight: 'bold',
  },
  terms: {
    alignItems: 'center',
    marginTop: 200,
    justifyContent: 'flex-end',
  },
  errorText: {
    color: '#FF9294',
    fontWeight: '800',
    fontSize: 20,
    height: 30,
  },
});
