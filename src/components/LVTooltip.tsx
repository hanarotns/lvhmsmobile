import React, { ReactNode, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Popover, {
  PopoverMode,
  PopoverPlacement,
} from 'react-native-popover-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LVTooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: PopoverPlacement;
  offset?: number;
  tooltipStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const LVTooltip = ({
  children,
  content,
  placement = PopoverPlacement.AUTO,
  offset = 6,
  tooltipStyle,
  textStyle,
}: LVTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <Popover
      mode={PopoverMode.RN_MODAL}
      isVisible={isVisible}
      placement={placement}
      offset={offset}
      displayAreaInsets={insets}
      onRequestClose={() => setIsVisible(false)}
      arrowSize={{
        width: 14,
        height: 7,
      }}
      popoverStyle={[styles.tooltip, tooltipStyle]}
      backgroundStyle={styles.background}
      from={(sourceRef) => (
        <Pressable
          ref={sourceRef}
          collapsable={false}
          renderToHardwareTextureAndroid
          hitSlop={8}
          onPress={() => setIsVisible(true)}
        >
          {children}
        </Pressable>
      )}
    >
      <View>
        {typeof content === 'string' ? (
          <Text style={[styles.text, textStyle]}>{content}</Text>
        ) : (
          content
        )}
      </View>
    </Popover>
  );
};

export default LVTooltip;

const styles = StyleSheet.create({
  tooltip: {
    maxWidth: 280,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#333333',
  },

  text: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
  },

  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
});
