import {Dimensions, Platform} from 'react-native';
import {getBottomSpace, getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';

const {width, height} = Dimensions.get('window');

export default {
    isiOS: Platform.OS === 'ios',
    statusBar: getStatusBarHeight(true),
    bottomSpace: ifIphoneX(getBottomSpace(), 15),
    appBar: Platform.select({ios: 44, android: 56}),
    keyboardVerticalOffset: ifIphoneX(88, 64),
    widthScreen: width,
    heightScreen: height,
    yottaLargeText: 38,
    zettaLargeText: 36,
    exaLargeText: 34,
    petaLargeText: 32,
    teraLargeText: 30,
    megaLargeText: 27,
    xxxLargeText: 25,
    xxLargeText: 23,
    xLargeText: 21,
    largeText: 19,
    mediumText: 17,
    normalText: 15,
    smallText: 13,
    tinyText: 11,
    atomText: 9
}
