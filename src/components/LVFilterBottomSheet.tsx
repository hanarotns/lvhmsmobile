import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';
import { Text } from 'react-native';

const LVFilterBottomSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const snapPoints = useMemo(() => ['50%'], []);

  return (
    <BottomSheetModal ref={ref} snapPoints={snapPoints} enablePanDownToClose>
      <BottomSheetView style={{ padding: 20, paddingBottom: 50, height: 200 }}>
        <Text>조회 필터</Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default LVFilterBottomSheet;
