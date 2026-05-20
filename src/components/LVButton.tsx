import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import LVStyles from './LVStyles';

const LVButton = (props: any) => {
  const {
    img,
    title,
    subtitle,
    onPress,
    buttonStyle,
    textStyle,
    subTextStyle,
    imgStyle,
    rightImg,
    disabled = false,
  } = props;

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, buttonStyle]}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      onPress={() => {
        if (!disabled && onPress) {
          onPress();
        }
      }}
    >
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {img && (
          <Image
            source={img}
            style={[LVStyles.iconS, { marginRight: 8 }, imgStyle]}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            disabled && styles.buttonTextDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
        {rightImg && (
          <Image
            source={rightImg}
            style={[LVStyles.iconS, { marginLeft: 8 }, imgStyle]}
          />
        )}
      </View>

      {subtitle && (
        <Text
          style={[
            styles.buttonSubtext,
            disabled && styles.buttonSubtextDisabled,
            subTextStyle,
          ]}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default LVButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#27A7FF',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#F3F5F7',
    borderColor: '#D5DADF',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: '#AEB6BF',
  },
  buttonSubtext: {
    color: '#1E2125',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 10,
  },
  buttonSubtextDisabled: {
    color: '#AEB6BF',
  },
});
