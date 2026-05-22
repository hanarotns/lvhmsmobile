import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {View, Image, StyleSheet, Platform} from 'react-native';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  withPreventDoubleClick,
  LVModal,
  LVButton,
  LVFlag,
  LVRadioButton,
  LVTwoLine,
  LVDatePicker,
  LVSection,
  LVSelectBox,
  LVLoadingIndicator,
  Text,
  LVChip,
  LVApprLine,
  DateTimeField,
  LVDateTimePicker,
  LVFormOfContents,
} from '~/component'; // 공통컴포넌트
import LVStyles from '~/component/LVStyles';
import * as icon from '~/assets/images';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import {Util} from '~/lib';
import {Icon, Input} from '@ui-kitten/components';
import * as Action from './Action'; // API통신

import {AppStore} from '~/store';
import {useRecoilState} from 'recoil';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useRoute, RouteProp} from '@react-navigation/native';

import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '~/component/CheckBox';

const PAL010301 = () => {
  const movingScreen = useNavigation();
  const [session, setSession] = useRecoilState(AppStore.sessionState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 나타내는 상태 변수

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
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View>
          <Text>PAL010301</Text>
        </View>
      </ScrollView>
    </View>
  );
};
export default PAL010301;

const styles = StyleSheet.create({});
