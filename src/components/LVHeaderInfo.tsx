// src/components/HeaderInfo.tsx
import Text from '@/src/components/CustomText';
import Constants from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

import env from '@/src/lib/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const envConfig = env();
let fetchURL = envConfig.fetchURL;
const settingUrl = async () => {
  fetchURL = await AsyncStorage.getItem('url');
};
settingUrl();

const LVHeaderInfo = () => {
  const version = Constants.expoConfig?.version ?? '-';

  useEffect(() => {
    const res = func();
  }, []);

  const func = async () => {
    fetchURL = await AsyncStorage.getItem('url');
    return fetchURL;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.url} numberOfLines={1}>
        {fetchURL?.indexOf('qa') !== -1 ? 'BETA' : ''}
      </Text>
      <Text style={styles.info}>
        {Platform.OS} / v{version}
      </Text>
    </View>
  );
};

export default LVHeaderInfo;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    paddingRight: 12,
    maxWidth: 220,
  },
  url: {
    fontSize: 10,
    color: '#6A727B',
  },
  info: {
    fontSize: 10,
    color: '#6A727B',
  },
});
