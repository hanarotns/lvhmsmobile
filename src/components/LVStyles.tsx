import {StyleSheet} from 'react-native';

const LVStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  container: {
    padding: 16,
  },
  iconXS: {
    width: 18,
    height: 18,
  },
  iconS: {
    width: 24,
    height: 24,
  },
  textS: {
    fontSize: 12,
    fontWeight: '400',
    color: '#454D58',
  },
  textM: {
    fontSize: 16,
    fontWeight: '600',
    color: '#454D58',
  },
  textL: {
    fontSize: 20,
    fontWeight: '800',
    color: '#454D58',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default LVStyles;
