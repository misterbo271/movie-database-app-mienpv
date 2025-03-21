import { StyleSheet } from 'react-native';
import colors from './colors';
import dimens from './dimens';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.containerColor,
  },
  
  title: {
    fontSize: dimens.largeText,
    color: colors.primaryTextColor,
    fontFamily: 'GoogleSans-Bold'
  },

  text: {
    color: colors.primaryTextColor,
    fontSize: dimens.normalText,
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 