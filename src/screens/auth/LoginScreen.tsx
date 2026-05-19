import React from 'react';
import { Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>LoginScreen</Text>
        <Button
          title='회원가입'
          onPress={() => {
            navigation.navigate('SignUp');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
