import { Fetch, env } from '@/src/lib';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import React, { useCallback, useState } from 'react';
// import * as Action from './Action';
const envConfig = env();
/**
 * useModal : Modal과 Recoil을 함께 사용할 수 없으므로 이 경우 true로 설정
 * @param {*} props
 * @returns
 */
const SelectBox = (props) => {
  let {
    value,
    editable,
    displayField,
    valueField,
    onChange,
    commonCode,
    disabled,
    params,
    useModal,
    sql = false,
    placeholder,
  } = props;
  const [data, setData] = useState(props.data);
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(-1));
  let [timer, setTimer] = useState(); // fake code
  // if (!useModal) {
  //     [timer, setTimer] = useRecoilState(AppStore.scanInterval);
  // }

  if (editable == undefined) {
    editable = true;
  }
  if (disabled == undefined) {
    disabled = false;
  }
  if (!displayField) {
    displayField = 'LOC_VALUE';
  }
  if (!valueField) {
    valueField = 'DT_CODE';
  }

  React.useEffect(() => {
    setData(props.data);
  }, [props.data]);

  React.useEffect(() => {
    value &&
      data &&
      data.filter((d, i) => {
        if (d[valueField] == value) {
          setSelectedIndex(new IndexPath(i));
        }
        return d[valueField] == value;
      });
  }, [value, data]);

  React.useEffect(() => {
    if (commonCode || params) {
      // if (commonCode) {
      //     commonCode = { "groupCode": commonCode }
      // }
      Fetch.fetchCommonCode(commonCode || params, sql).then((result) => {
        if (result.TYPE === 1) {
          setData(result.data);
        }
      });
    }
  }, [commonCode, params?.SQL.COMPANY_CODE]);

  const getValue = useCallback((index, addrData, value) => {
    let rowIndex = index.row;
    if (!addrData) return '';
    if (addrData.length > 0) {
      if (rowIndex == -1 && value) {
        rowIndex = addrData.findIndex((data) => data[valueField] === value);
      }
      if (rowIndex == -1) {
        return '';
      }
      let data = addrData[rowIndex];
      return data[displayField];
    }
    return '';
  }, []);

  return (
    <Select
      {...props}
      onPressIn={() => {
        setTimer(envConfig.LONG_TIME);
      }}
      onFocus={() => {
        if (props.onFocus) {
          props.onFocus();
        }
      }}
      onBlur={() => {
        if (props.onBlur) {
          props.onBlur();
        }
        setTimer(envConfig.SHORT_TIME);
      }}
      value={getValue(selectedIndex, data, value)}
      placeholder={placeholder || '선택하세요.'}
      selectedIndex={selectedIndex.row > -1 ? selectedIndex : null}
      disabled={disabled}
      onSelect={(index) => {
        if (editable) {
          setSelectedIndex(index);
          if (onChange) {
            onChange(
              data[index.row][valueField],
              data[index.row][displayField],
              index.row,
              data,
            );
          }
        }
      }}
    >
      {data?.map((d, idx) => {
        return <SelectItem key={idx} title={d[displayField]}></SelectItem>;
      })}
    </Select>
  );
};
export default SelectBox;
