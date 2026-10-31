/**
 * @format
 */

import {AppRegistry} from 'react-native';
import * as RNScreens from 'react-native-screens';

// Polyfill compatibilityFlags for react-native-screens interoperability with @react-navigation/native-stack
if (!RNScreens.compatibilityFlags) {
  // @ts-ignore
  RNScreens.compatibilityFlags = {
    isNewBackTitleImplementation: true,
    usesHeaderFlexboxImplementation: false,
    usesNewAndroidHeaderHeightImplementation: false,
    usesStableTabsApi: false,
  };
}

import App from './App';
import {name as appName} from './app.json';

// Log full stack trace for any uncaught errors
if (global.ErrorUtils) {
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('GLOBAL ERROR STACK:', error?.message);
    if (error?.stack) {
      console.error(error.stack);
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

AppRegistry.registerComponent(appName, () => App);
