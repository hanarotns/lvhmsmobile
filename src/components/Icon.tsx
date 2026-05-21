import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon as PaperIcon } from 'react-native-paper';

const Icon = (props: any) => {
  const { name, size, color, disabled } = props;
  const ref = React.useRef<any>();

  React.useEffect(() => {}, []);
  return props.onPress ? (
    <TouchableOpacity
      ref={ref}
      disabled={disabled}
      onPress={(e) => {
        props.onPress({ e, button: ref.current, props: ref.current?.props });
      }}
    >
      <PaperIcon
        size={size ? size : 24}
        color={disabled ? 'gray' : color || '#FFFFFF'}
        source={name}
      />
    </TouchableOpacity>
  ) : (
    <PaperIcon
      size={size ? size : 24}
      color={disabled ? 'gray' : color || '#FFFFFF'}
      source={name}
    />
  );
};
export default Icon;
