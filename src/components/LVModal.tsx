import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as icon from '@/src/assets/images';
import Text from '@/src/components/CustomText';
import LVButton from '@/src/components/LVButton';
import { ScrollView } from 'react-native-gesture-handler';
import LVStyles from './LVStyles';

const LVModal = (props: any) => {
  const {
    category,
    titleIcon,
    title,
    contents,
    onVisible,
    onOk,
    buttonText,
    isCancelDisabled,
  } = props;
  return (
    <View style={styles.bgView}>
      <View
        style={
          category === 'entire' ? styles.modalEntireView : styles.modalView
        }
      >
        {/* 모달 헤더 */}
        <View style={styles.modalHeader}>
          <View style={styles.titleView}>
            <Image
              source={titleIcon || icon.ico_check_simple}
              style={[LVStyles.iconS, { tintColor: '#373747' }]}
            />
            <Text style={styles.titleText}>{title}</Text>
          </View>
          {!isCancelDisabled && (
            <TouchableOpacity
              style={{ padding: 4 }}
              onPress={() => {
                onVisible(false);
              }}
            >
              <Image source={icon.ico_close} style={[LVStyles.iconS]} />
            </TouchableOpacity>
          )}
        </View>
        {/* 컨텐츠 */}
        <ScrollView style={styles.contentsScrollView}>{contents}</ScrollView>
        <LVButton
          title={buttonText || '저장'}
          LVButton
          onPress={() => {
            onOk(true);
          }}
          buttonStyle={{
            borderRadius: 4,
          }}
          textStyle={{
            fontSize: 20,
            fontWeight: '600',
          }}
        />
      </View>
    </View>
  );
};
export default LVModal;

const styles = StyleSheet.create({
  bgView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#454D58BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'space-between',
    borderRadius: 8,
    width: '80%',
    maxHeight: '90%',
  },
  modalEntireView: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  contentsScrollView: {
    marginVertical: 16,
  },
});
