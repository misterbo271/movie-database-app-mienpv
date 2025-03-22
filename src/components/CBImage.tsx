import React from 'react';
import { Image, ImageProps } from '@rneui/themed';
import ImageUtil from '../utils/ImageUtil';
import { ImageSourcePropType, StyleSheet } from 'react-native';

interface CBImageProps extends Omit<ImageProps, 'source'> {
  source?: string | ImageSourcePropType;
  fitSize?: boolean;
  fallbackSource?: ImageSourcePropType;
}

const DEFAULT_PLACEHOLDER = { uri: 'https://via.placeholder.com/500x750?text=No+Image' };

const CBImage: React.FC<CBImageProps> = (props) => {
  const { fitSize, style, fallbackSource, ...rest } = props;
  const finalProps: ImageProps = { ...rest } as ImageProps;
  
  // Handle empty or undefined source
  if (!props.source) {
    finalProps.source = fallbackSource || DEFAULT_PLACEHOLDER;
  } else if (typeof props.source === 'string') {
    if (props.source.trim() === '') {
      // Handle empty string
      finalProps.source = fallbackSource || DEFAULT_PLACEHOLDER;
    } else {
      // Handle valid string (getting from assets)
      finalProps.source = ImageUtil.getImage(props.source);
    }
  } else if (
    typeof props.source === 'object' && 
    'uri' in props.source && 
    (!props.source.uri || props.source.uri === '')
  ) {
    // Handle object with empty uri
    finalProps.source = fallbackSource || DEFAULT_PLACEHOLDER;
  } else {
    // Use the provided source
    finalProps.source = props.source;
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