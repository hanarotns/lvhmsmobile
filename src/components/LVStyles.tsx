import { StyleSheet } from 'react-native';

const LVStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 16,
  },
  bottomButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
    position: 'absolute',
    width: '100%',
    bottom: 0,
    gap: 8,
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
