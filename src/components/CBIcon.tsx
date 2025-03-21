import React from 'react';
import { Icon, IconProps } from '@rneui/themed';
import colors from '../configs/colors';

interface CBIconProps extends IconProps {
  define?: string;
}

const CBIcon: React.FC<CBIconProps> = (props) => {
  const theme = {
    colors: {
      scheme: 'light'
    }
  };
  
  // Helper function để lấy màu dựa trên define
  const getIconColor = (define: string, scheme: string): string => {
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
  
  // Ưu tiên color từ props, nếu không có thì lấy từ define
  const iconColor = props.color || getIconColor(props.define || '', theme.colors.scheme);
  
  return <Icon {...props} color={iconColor} />;
};

export default CBIcon; 