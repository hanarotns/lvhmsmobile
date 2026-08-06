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
  whiteBgButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D5DCE5',
  },
  whiteBgButtonText: {
    color: '#373747',
  },
  grayBgButton: {
    flex: 1,
    backgroundColor: '#939DAA',
  },
  defaultButton: {
    flex: 1,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default LVStyles;
