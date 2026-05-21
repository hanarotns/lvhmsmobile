import React from 'react';
import { Text, TextProps } from 'react-native';

const CustomText: React.FC<TextProps> = ({ children, style, ...props }) => {
  return (
    <Text
      style={[{ fontFamily: 'Pretendard', color: '#373747' }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
