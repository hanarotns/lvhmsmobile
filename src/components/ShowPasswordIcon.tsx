import Icon from '@/src/components/Icon';
import React from 'react';

//password 보기 활성/비활성화 기능
const ShowPasswordIcon = (props) => (
  <Icon
    {...props}
    name={props.visiblePwd ? 'eye-outline' : 'eye-off-outline'}
    onPress={() => props.setVisible(!props.visiblePwd)}
  />
);

export default ShowPasswordIcon;
