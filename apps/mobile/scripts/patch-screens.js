const fs = require('fs');
const path = require('path');

function patchScreens() {
  try {
    const screensPath = require.resolve('react-native-screens/package.json', { paths: [__dirname, process.cwd()] });
    const screensDir = path.dirname(screensPath);

    // Patch lib/module/index.js
    const moduleIndex = path.join(screensDir, 'lib', 'module', 'index.js');
    if (fs.existsSync(moduleIndex)) {
      let content = fs.readFileSync(moduleIndex, 'utf8');
      if (!content.includes('compatibilityFlags')) {
        content += '\nexport const compatibilityFlags = { isNewBackTitleImplementation: true, usesHeaderFlexboxImplementation: false, usesNewAndroidHeaderHeightImplementation: false, usesStableTabsApi: false };\nexport const featureFlags = {};\n';
        fs.writeFileSync(moduleIndex, content, 'utf8');
      }
    }

    // Patch src/index.tsx
    const srcIndex = path.join(screensDir, 'src', 'index.tsx');
    if (fs.existsSync(srcIndex)) {
      let content = fs.readFileSync(srcIndex, 'utf8');
      if (!content.includes('compatibilityFlags')) {
        content += '\nexport const compatibilityFlags = { isNewBackTitleImplementation: true, usesHeaderFlexboxImplementation: false, usesNewAndroidHeaderHeightImplementation: false, usesStableTabsApi: false };\nexport const featureFlags = {};\n';
        fs.writeFileSync(srcIndex, content, 'utf8');
      }
    }

    // Patch lib/commonjs/index.js
    const cjsIndex = path.join(screensDir, 'lib', 'commonjs', 'index.js');
    if (fs.existsSync(cjsIndex)) {
      let content = fs.readFileSync(cjsIndex, 'utf8');
      if (!content.includes('compatibilityFlags')) {
        content += '\nexports.compatibilityFlags = { isNewBackTitleImplementation: true, usesHeaderFlexboxImplementation: false, usesNewAndroidHeaderHeightImplementation: false, usesStableTabsApi: false };\nexports.featureFlags = {};\n';
        fs.writeFileSync(cjsIndex, content, 'utf8');
      }
    }

    console.log('[patch-screens] Verified react-native-screens compatibility flags.');
  } catch (e) {
    console.warn('[patch-screens] Note:', e.message);
  }
}

patchScreens();
