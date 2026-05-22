import React from 'react';

import { Icon } from '@/src/components';
import { StyleSheet } from 'react-native';
import {
  ErrorToast,
  InfoToast,
  SuccessToast,
  ToastProps,
} from 'react-native-toast-message';

export const toastConfig = {
  success: (props: ToastProps) => (
    <SuccessToast
      {...props}
      style={toastStyle.toast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.successText1}
      renderLeadingIcon={() => (
        <Icon source='checkmark-outline' color='#6CD588' />
      )}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={toastStyle.toast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.errorText1}
      renderLeadingIcon={() => <Icon source='slash-outline' color='#FF9294' />}
    />
  ),
  info: (props: ToastProps) => (
    <InfoToast
      {...props}
      style={toastStyle.toast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.infoText1}
      renderLeadingIcon={() => <Icon source='info-outline' color='#27A7FF' />}
    />
  ),
};

const toastStyle = StyleSheet.create({
  toast: {
    backgroundColor: '#373747CC',
    borderLeftColor: '#373747CC',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 16,
  },
  toastContent: {
    paddingHorizontal: 5,
  },
  successText1: {
    color: '#6CD588',
    fontSize: 14,
  },
  errorText1: {
    color: '#FF9294',
    fontSize: 14,
  },
  infoText1: {
    color: '#27A7FF',
    fontSize: 14,
  },
});
