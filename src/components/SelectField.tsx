import { Fetch } from '@/src/lib';
import { useNavigation } from '@react-navigation/native';
import {
  IndexPath,
  Layout,
  Select,
  SelectItem,
  Text,
} from '@ui-kitten/components';
import React from 'react';

const SelectField = (props) => {
  const { groupCode, style, items } = props;
  const [data, setData] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(-1));
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    if (items) {
      setData(items);
    }
    if (groupCode) {
      Fetch.getCommonCode({
        groupCode: groupCode,
        searchType: 'value',
      }).then((result) => {
        setData(result.data);
      });
    }
  }, [navigation]);

  const getSelectedTitle = (item, index, value) => {
    var retValue = null;
    if (value) {
      item.map((data) => {
        if (data.DT_CODE == value) {
          retValue = data.LOC_VALUE;
        }
      });
    }
    // if (item.length > 0 && index) {
    //     if (index.row == -1) {
    //         retValue = '';
    //     }
    //     retValue = item[index.row]['LOC_VALUE'];
    // }

    return retValue;
  };
  const onCodeSelect = (index, item, setSelect) => {
    if (props.onChangeValue) {
      props.onChangeValue(item[index.row].DT_CODE);
    }

    setSelect(index);
  };
  return props.onFieldShow === true ? (
    <Select
      disabled={props.disabled}
      style={[
        {
          flex: 1,
          margin: 2,
        },
        style,
      ]}
      value={getSelectedTitle(data, selectedIndex, props.value)}
      placeholder={'선택하세요.'}
      selectedIndex={selectedIndex.row > -1 ? selectedIndex : null}
      onSelect={(index) => {
        onCodeSelect(index, data, setSelectedIndex);
      }}
    >
      {data.map((item) => (
        <SelectItem key={item.DT_CODE} title={item.LOC_VALUE} />
      ))}
    </Select>
  ) : (
    <Layout
      style={[
        {
          marginTop: props.label ? 10 : 0,
          paddingTop: 0,
          flex: 1,
          backgroundColor: '#FFFFFF',
        },
        style,
      ]}
    >
      {props.label ? (
        <Text
          style={{
            marginTop: 2,
            color: 'gray',
          }}
          category='label'
        >
          {props.label}
        </Text>
      ) : null}

      <Select
        disabled={props.disabled}
        style={{
          flex: 1,
          margin: 2,
          paddingTop: 0,
          marginTop: 0,
        }}
        value={getSelectedTitle(data, selectedIndex, props.value)}
        placeholder={'선택하세요.'}
        selectedIndex={selectedIndex.row > -1 ? selectedIndex : null}
        onSelect={(index) => {
          onCodeSelect(index, data, setSelectedIndex);
        }}
      >
        {data.map((item) => (
          <SelectItem key={item.DT_CODE} title={item.LOC_VALUE} />
        ))}
      </Select>
    </Layout>
  );
};
export default SelectField;
