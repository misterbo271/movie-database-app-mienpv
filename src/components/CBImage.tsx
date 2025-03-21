import React from 'react';
import { Image, ImageProps } from '@rneui/themed';
import ImageUtil from '../utils/ImageUtil';
import { ImageSourcePropType, StyleSheet } from 'react-native';

interface CBImageProps extends Omit<ImageProps, 'source'> {
  source?: string | ImageSourcePropType;
  fitSize?: boolean;
}

const CBImage: React.FC<CBImageProps> = (props) => {
  const { fitSize, style, ...rest } = props;
  const finalProps: ImageProps = { ...rest } as ImageProps;
  
  if (typeof props.source === 'string') {
    finalProps.source = ImageUtil.getImage(props.source);
  }
  
  if (fitSize) {
    finalProps.style = [styles.fitImage, style];
    finalProps.resizeMode = 'contain';
  } else {
    finalProps.style = style;
  }
  
  return (
    <Image {...finalProps} />
  );
};

const styles = StyleSheet.create({
  fitImage: {
    width: '100%',
    height: '100%',
  }
});

export default CBImage; 