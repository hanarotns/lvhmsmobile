import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Spinner} from '@ui-kitten/components';

const LVLoadingIndicator = (props: any) => (
  <View style={[styles.indicator, props.styleIndicator]}>
    <Spinner
      size="giant"
      status="primary"
      style={[styles.loading, props.styleLoading]}
    />
  </View>
);

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#454D585F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    borderColor: '#fff',
  },
});

export default LVLoadingIndicator;
