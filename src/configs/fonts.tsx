import { Platform } from 'react-native';


const fontFamily = {
  black: Platform.OS === 'ios' ? 'SourceSansPro-Black' : 'SourceSansPro-Black',
  bold: Platform.OS === 'ios' ? 'SourceSansPro-Bold' : 'SourceSansPro-Bold',
  light: Platform.OS === 'ios' ? 'SourceSansPro-Light' : 'SourceSansPro-Light',
  regular: Platform.OS === 'ios' ? 'SourceSansPro-Regular' : 'SourceSansPro-Regular',
  semibold: Platform.OS === 'ios' ? 'SourceSansPro-Semibold' : 'SourceSansPro-Semibold',
};

// Font sizes
const fontSize = {
  tiny: 10,
  small: 12,
  normal: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  huge: 30,
};

// Font styles
const fontStyles = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.huge,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxlarge,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xlarge,
  },
  h4: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.large,
  },
  h5: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.medium,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.normal,
  },
  bodyBold: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.normal,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.small,
  },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.medium,
  },
};

export default {
  fontFamily,
  fontSize,
  fontStyles,
}; 