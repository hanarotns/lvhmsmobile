import Text from '@/src/components/CustomText';
import LVStyles from '@/src/components/LVStyles';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LVProfileImage from './LVProfileImage';

const LVApplicantInfo = (props: any) => {
  const { imageUrl, info } = props;
  return (
    <View
      style={[LVStyles.row, { flex: 1, justifyContent: 'flex-start', gap: 8 }]}
    >
      <LVProfileImage imgStyle={styles.profileImg} path={imageUrl} />
      <Text style={{ fontWeight: '500' }}>{info}</Text>
    </View>
  );
};
export default LVApplicantInfo;

const styles = StyleSheet.create({
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
