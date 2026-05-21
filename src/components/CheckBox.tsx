import React, { useState } from 'react';
import { CheckBox as UiKittenCheckBox } from '@ui-kitten/components';

const CheckBox = (props) => {
    const { label, onChange } = props;
    const [active, setActive] = React.useState(false);


    return (
        <UiKittenCheckBox
            checked={active}
            onChange={checked => {
                setActive(checked)
                if (onChange) {
                    onChange(checked)
                }
            }}
        >
            {label}
        </UiKittenCheckBox>
    )
}
export default CheckBox;