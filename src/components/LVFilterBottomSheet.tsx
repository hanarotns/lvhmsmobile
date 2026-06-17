import Text from '@/src/components/CustomText';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import LVButton from './LVButton';
import LVDateTimePicker from './LVDateTimePicker';
import LVStyles from './LVStyles';

interface LVFilterBottomSheetProps {
  title?: string;
  subTitle?: string;
  onSearch?: () => void;
  fromDate: Date;
  setFromDate: (date: Date) => void;
  toDate: Date;
  setToDate: (date: Date) => void;
}

const LVFilterBottomSheet = forwardRef<
  BottomSheetModal,
  LVFilterBottomSheetProps
>((props, ref) => {
  const {
    title = '상세조회',
    subTitle = '리스트에 대한 조회입니다',
    onSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  } = props;

  const snapPoints = useMemo(() => ['50%'], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      style={styles.modalView}
    >
      <BottomSheetView style={styles.modalSheetView}>
        <View style={styles.header}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subTitleText}>{subTitle}</Text>
        </View>

        <View style={styles.body}>
          <View style={LVStyles.row}>
            <Text>기간</Text>
            <LVDateTimePicker
              date={fromDate}
              setDate={setFromDate}
              useTime={false}
            />
            <Text>~</Text>
            <LVDateTimePicker
              date={toDate}
              setDate={setToDate}
              useTime={false}
            />
          </View>
        </View>

        <LVButton
          title='조회'
          onPress={onSearch}
          buttonStyle={{ flex: 1, marginHorizontal: 20 }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default LVFilterBottomSheet;

const styles = StyleSheet.create({
  modalView: {
    borderWidth: 2,
    borderRadius: 16,
    borderColor: 'lightgray',
  },
  modalSheetView: {
    paddingBottom: 100,
    minHeight: 300,
  },
  header: {
    padding: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  subTitleText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  body: {
    padding: 20,
  },
});
