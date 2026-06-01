import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLoginStore } from '@/src/stores/loginStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

import { RefreshControl, ScrollView, Text } from '@/src/components';
import { useEmpStore } from '@/src/stores/empStore';
import 'dayjs/locale/ko';

const PAL010301 = () => {
  const movingScreen = useNavigation();
  const loginInfo = useLoginStore((state) => state.loginInfo);
  const setLoginInfo = useLoginStore((state) => state.setLoginInfo);
  const sessionInfo = useSessionStore((state) => state.sessionInfo);
  const setSessionInfo = useSessionStore((state) => state.setSessionInfo);
  const empInfo = useEmpStore((state) => state.empInfo);
  const setEmpInfo = useEmpStore((state) => state.setEmpInfo);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [myApprList, setMyApprList] = useState([]);
  const approvalLineRef = useRef<any>(null);

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    setLoading(true);

    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      mount();
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View>
          <Text>PAL010301</Text>
        </View>
      </ScrollView>
    </View>
  );
};
export default PAL010301;

const styles = StyleSheet.create({});
