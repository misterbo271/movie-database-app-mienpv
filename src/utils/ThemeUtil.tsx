import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

export function horizontalScale(size: number): number {
    if (Platform.OS === 'ios' && Platform.isPad) return size;
    return width / guidelineBaseWidth * size;
}

export function verticalScale(size: number): number {
    if (Platform.OS === 'ios' && Platform.isPad) return size;
    return height / guidelineBaseHeight * size;
}

export function moderateScale(size: number, factor: number = 0.5): number {
    if (Platform.OS === 'ios' && Platform.isPad) return size;
    return size + (horizontalScale(size) - size) * factor;
}