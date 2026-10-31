const fs = require('fs');
const path = require('path');

function patchScreens() {
  try {
    const screensPath = require.resolve('react-native-screens/package.json', { paths: [__dirname, process.cwd()] });
    const screensDir = path.dirname(screensPath);

    const screenStackItemCode = `
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Screen from './components/Screen';
import { ScreenStackHeaderConfig } from './components/ScreenStackHeaderConfig';

export const ScreenStackItem = React.forwardRef(function ScreenStackItem(props, ref) {
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
    Screen,
    {
      ref: ref,
      enabled: true,
      isNativeStack: true,
      activityState: activityState,
      shouldFreeze: shouldFreeze,
      stackPresentation: stackPresentation,
      style: [StyleSheet.absoluteFill, style],
      ...rest,
    },
    headerConfig ? React.createElement(ScreenStackHeaderConfig, headerConfig) : null,
    React.createElement(
      View,
      { style: [StyleSheet.absoluteFill, contentStyle] },
      children
    )
  );
});
`;

    // Patch lib/module/index.js
    const moduleIndex = path.join(screensDir, 'lib', 'module', 'index.js');
    if (fs.existsSync(moduleIndex)) {
      let content = fs.readFileSync(moduleIndex, 'utf8');
      if (!content.includes('ScreenStackItem')) {
        content += '\nexport const compatibilityFlags = { isNewBackTitleImplementation: true, usesHeaderFlexboxImplementation: false, usesNewAndroidHeaderHeightImplementation: false, usesStableTabsApi: false };\nexport const featureFlags = {};\n' + screenStackItemCode;
        fs.writeFileSync(moduleIndex, content, 'utf8');
      }
    }

    // Patch src/index.tsx
    const srcIndex = path.join(screensDir, 'src', 'index.tsx');
    if (fs.existsSync(srcIndex)) {
      let content = fs.readFileSync(srcIndex, 'utf8');
      if (!content.includes('ScreenStackItem')) {
        content += '\nexport const compatibilityFlags = { isNewBackTitleImplementation: true, usesHeaderFlexboxImplementation: false, usesNewAndroidHeaderHeightImplementation: false, usesStableTabsApi: false };\nexport const featureFlags = {};\n' + screenStackItemCode;
        fs.writeFileSync(srcIndex, content, 'utf8');
      }
    }

    // Patch lib/commonjs/index.js
    const cjsIndex = path.join(screensDir, 'lib', 'commonjs', 'index.js');
    if (fs.existsSync(cjsIndex)) {
      let content = fs.readFileSync(cjsIndex, 'utf8');
      if (!content.includes('ScreenStackItem')) {
        const cjsCode = `
exports.compatibilityFlags = {
  isNewBackTitleImplementation: true,
  usesHeaderFlexboxImplementation: false,
  usesNewAndroidHeaderHeightImplementation: false,
  usesStableTabsApi: false,
};
exports.featureFlags = {};
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _Screen = _interopRequireDefault(require("./components/Screen"));
var _ScreenStackHeaderConfig = require("./components/ScreenStackHeaderConfig");

exports.ScreenStackItem = _react.default.forwardRef(function ScreenStackItem(props, ref) {
  var children = props.children,
    headerConfig = props.headerConfig,
    activityState = props.activityState,
    shouldFreeze = props.shouldFreeze,
    screenId = props.screenId,
    style = props.style,
    contentStyle = props.contentStyle,
    stackPresentation = props.stackPresentation;

  return _react.default.createElement(
    _Screen.default,
    {
      ref: ref,
      enabled: true,
      isNativeStack: true,
      activityState: activityState,
      shouldFreeze: shouldFreeze,
      stackPresentation: stackPresentation,
      style: [_reactNative.StyleSheet.absoluteFill, style],
    },
    headerConfig ? _react.default.createElement(_ScreenStackHeaderConfig.ScreenStackHeaderConfig, headerConfig) : null,
    _react.default.createElement(
      _reactNative.View,
      { style: [_reactNative.StyleSheet.absoluteFill, contentStyle] },
      children
    )
  );
});
`;
        content += cjsCode;
        fs.writeFileSync(cjsIndex, content, 'utf8');
      }
    }

    console.log('[patch-screens] Verified react-native-screens compatibility flags and ScreenStackItem.');
  } catch (e) {
    console.warn('[patch-screens] Note:', e.message);
  }
}

patchScreens();
