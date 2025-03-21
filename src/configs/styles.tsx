import { StyleSheet } from 'react-native';
import colors from './colors';
import dimens from './dimens';
import fonts from './fonts';
import { moderateScale } from '../utils/ThemeUtil';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.containerColor
  },  
  title: {
    fontSize: dimens.largeText,
    color: colors.primaryTextColor,
    fontFamily: fonts.fontFamily.bold
  },
  content: {
    fontSize: dimens.mediumText,
    color: colors.primaryTextColor,
    fontFamily: fonts.fontFamily.semibold
  },
  text: {
    color: colors.primaryTextColor,
    fontSize: dimens.normalText,
    fontFamily: fonts.fontFamily.regular
  },
  image: {
    width: moderateScale(240),
    height: moderateScale(240)
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
