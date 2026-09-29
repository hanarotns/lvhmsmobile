import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface EmployeeInfo {
  EMP_ID?: string;
  EMP_NAME_LC?: string;
}

interface DayLoborerScreenProps {
  empInfo: EmployeeInfo;
}

const DayLoborerScreen = ({ empInfo }: DayLoborerScreenProps) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.format('YYYY-MM-DD');
  const formattedTime = currentTime.format('HH:mm:ss');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 타이틀 */}
        <Text style={styles.title}>{empInfo?.EMP_NAME_LC}</Text>

        {/* QR */}
        <View style={styles.qrContainer}>
          <QRCode value={empInfo?.EMP_ID ?? ''} size={200} />
        </View>

        {/* 현재시간 */}
        <View style={styles.timeContainer}>
          <Text style={styles.date}>{formattedDate}</Text>

          <Text style={styles.time}>{formattedTime}</Text>
        </View>
      </View>
    </View>
  );
};

export default DayLoborerScreen;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',

    // iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,

    // Android
    elevation: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
  },

  qrContainer: {
    padding: 18,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 30,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EAEAEA',
    marginBottom: 24,
  },

  infoContainer: {
    width: '100%',
    gap: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
  },

  empId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  empName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },

  timeContainer: {
    width: '100%',
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: 15,
    color: '#999',
    marginBottom: 6,
  },

  date: {
    fontSize: 20,
    color: '#777',
    marginBottom: 4,
  },

  time: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 1,
  },
});
