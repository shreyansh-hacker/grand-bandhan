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

if (!RNScreens.ScreenStackItem) {
  const React = require('react');
  const { StyleSheet, View } = require('react-native');
  // @ts-ignore
  RNScreens.ScreenStackItem = React.forwardRef(function ScreenStackItem(props, ref) {
    const {
      children,
      headerConfig,
      activityState,
      shouldFreeze,
      screenId,
      style,
      contentStyle,
      stackPresentation,
      ...rest
    } = props;

    return React.createElement(
      RNScreens.Screen,
      {
        ref,
        enabled: true,
        isNativeStack: true,
        activityState,
        shouldFreeze,
        stackPresentation,
        style: [StyleSheet.absoluteFill, style],
        ...rest,
      },
      headerConfig ? React.createElement(RNScreens.ScreenStackHeaderConfig, headerConfig) : null,
      React.createElement(View, { style: [StyleSheet.absoluteFill, contentStyle] }, children)
    );
  });
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
