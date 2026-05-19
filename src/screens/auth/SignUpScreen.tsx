import React from 'react';
import { Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={{ flex: 1, borderWidth: 1 }}>
        <Text>SignUpScreen</Text>
        <Button
          title='돌아가기'
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
