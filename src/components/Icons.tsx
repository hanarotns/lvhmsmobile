import Icon from '@/src/components/Icon';
import React from 'react';

export const BackIcon = ({ navigation }) => (
  <Icon
    onPress={() => {
      navigation.goBack();
    }}
    fill='black'
    style={{
      width: 50,
      height: 50,
    }}
    name='chevron-left-outline'
  />
);

export const CalendarIcon = (props) => <Icon {...props} name='calendar' />;

export const EditIcon = (props) => <Icon {...props} name='edit-outline' />;

export const LogoutIcon = (props) => (
  <Icon
    fill={'#27A7FF'}
    // onPress={() => {
    //     Fetch.logout().then((result) => {
    //         setLoginInfo({ ...loginInfo, ...{ loginPwd: null } })
    //         setSession(null);
    //     })
    // }}
    {...props}
    name='log-out-outline'
  />
);
