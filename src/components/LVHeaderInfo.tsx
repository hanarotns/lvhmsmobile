// src/components/HeaderInfo.tsx
import Text from '@/src/components/CustomText';
// import { API_BASE_URL } from '@/src/config/env';
import Constants from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

const LVHeaderInfo = () => {
  const version = Constants.expoConfig?.version ?? '-';

  return (
    <View style={styles.container}>
      <Text style={styles.url} numberOfLines={1}>
        {/* {API_BASE_URL} */}
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
