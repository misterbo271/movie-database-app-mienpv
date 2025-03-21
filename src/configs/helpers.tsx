import colors from './colors';

export const helpers = (define: string, scheme: string): string => {
  switch (define) {
    case 'primary':
      return colors.primaryColor;
    case 'secondary':
      return colors.secondaryColor;
    case 'tertiary':
      return colors.tertiaryColor;
    case 'text':
      return colors.primaryTextColor;
    case 'white':
      return colors.whiteColor;
    case 'black':
      return colors.blackColor;
    default:
      return define || colors.primaryTextColor;
  }
};