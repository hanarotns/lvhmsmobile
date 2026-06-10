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

type Props = {
  date: Date;
  setDate: (date: Date) => void;
};

const LVDateTimePicker: React.FC<Props> = ({ date, setDate }) => {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = (pickerMode: 'date' | 'time') => {
    setMode(pickerMode);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const onChange = (event: Event, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      closePicker();
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => openPicker('date')}
      >
        <Text style={styles.buttonText}>
          {dayjs(date).format('YYYY-MM-DD')}
        </Text>
        <Icon name='calendar' color='#6A727B' />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => openPicker('time')}
      >
        <Text style={styles.buttonText}>{dayjs(date).format('HH:mm')}</Text>
        <Icon name='clock-outline' color='#6A727B' />
      </TouchableOpacity>

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          locale='ko-KR'
          value={date}
          mode={mode}
          is24Hour
          display='spinner'
          onChange={onChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          transparent
          visible={showPicker}
          animationType='slide'
          onRequestClose={closePicker}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <DateTimePicker
                locale='ko-KR'
                value={date}
                mode={mode}
                is24Hour
                display='spinner'
                textColor='#373747'
                onChange={onChange}
                style={styles.dateTimePicker}
              />

              <LVButton
                title='확인'
                onPress={closePicker}
                buttonStyle={{ backgroundColor: 'transparent' }}
                textStyle={styles.confirmText}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  selectButton: {
    borderColor: '#D3D6DD',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#373747',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 320,
  },
  dateTimePicker: {
    width: 280,
    height: 180,
    alignSelf: 'center',
  },
  confirmText: {
    color: '#27A7FF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LVDateTimePicker;
