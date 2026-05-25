import Text from '@/src/components/CustomText';
import Icon from '@/src/components/Icon';
import LVButton from '@/src/components/LVButton';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const LVDatePicker: React.FC = (props) => {
  const { date, setDate } = props;

  const [mode, setMode] = useState<'date' | 'time'>();
  const [showModal, setShowModal] = useState(false);

  // 모달 오픈 & 피커 모드 설정
  const openModal = (pickerMode: 'date' | 'time') => {
    setMode(pickerMode);
    setShowModal(true);
  };

  // 날짜/시간 선택 이벤트
  const onChange = (_event: Event, selectedDate?: Date) => {
    // Android: 값 선택시 자동 close
    if (Platform.OS === 'android') setShowModal(false);
    if (selectedDate) setDate(selectedDate);
  };

  // 모달 내 닫기 버튼
  const closeModal = () => setShowModal(false);

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
      }}
    >
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => openModal('date')}
      >
        <Text style={styles.buttonText}>
          {dayjs(date).format('YYYY-MM-DD')}
        </Text>
        <Icon name='calendar' color='#6A727B' />
      </TouchableOpacity>
      <View
        style={{
          width: 8,
        }}
      />
      <Modal
        transparent
        visible={showModal}
        animationType='slide'
        onRequestClose={closeModal}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {mode && (
              <DateTimePicker
                locale='ko-KR'
                value={date}
                mode={mode}
                is24Hour={true}
                textColor='#373747'
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
              />
            )}
            {/* iOS는 picker 자체가 닫히지 않으니 닫기 버튼 필요 */}
            {Platform.OS === 'ios' && (
              <LVButton
                title='확인'
                onPress={closeModal}
                buttonStyle={{ backgroundColor: 'transparent' }}
                textStyle={{
                  color: '#27A7FF',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    borderColor: '#D3D6DD',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#373747',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 320,
  },
});

export default LVDatePicker;
