import React, {useState} from 'react';
import {CheckBox as UiKittenCheckBox} from '@ui-kitten/components';

interface CheckBoxProps {
  label?: React.ReactNode;
  value?: boolean; // controlled
  defaultValue?: boolean; // uncontrolled 초기값
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const LVCheckBox: React.FC<CheckBoxProps> = ({
  label,
  value,
  defaultValue = false,
  onChange,
  disabled = false,
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const checked = isControlled ? value : innerValue;

  const handleChange = (next: boolean) => {
    if (!isControlled) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  return (
    <UiKittenCheckBox
      checked={checked}
      disabled={disabled}
      onChange={handleChange}>
      {label}
    </UiKittenCheckBox>
  );
};

export default LVCheckBox;
