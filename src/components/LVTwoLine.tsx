import React from 'react';
import {StyleSheet, View, Text} from 'react-native';


const LVTwoLine = (props: any) => {
  const {type, label, content} = props;
  
  return(
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  )  
};
export default LVTwoLine;

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#454D58',
  },
  content: {
    fontSize: 14,
    fontWeight: '600',
    color: '#454D58',
  },
});