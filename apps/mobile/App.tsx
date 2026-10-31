import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { colors, typography } from './src/theme';
import { ImperialLogo, ServiceVerificationModal } from './src/components';
import { useVerificationManager } from './src/hooks';

function HydrationSplash() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.imperialNavyDark} />
      <ImperialLogo size="hero" showText textColor={colors.gold} withGlow />
      <ActivityIndicator size="small" color={colors.gold} style={styles.spinner} />
      <Text style={styles.keystoreText}>Verifying Android Keystore session...</Text>
    </View>
  );
}

function MainAppContent() {
  const { isHydrating, hydrate, isAuthenticated } = useAuthStore();
  const { activeVerification, isOpen, closeModal } = useVerificationManager();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isHydrating) {
    return <HydrationSplash />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
      {isAuthenticated && (
        <ServiceVerificationModal
          visible={isOpen}
          verification={activeVerification}
          onClose={closeModal}
        />
      )}
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <MainAppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.imperialNavyDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinner: {
    marginTop: 32,
    marginBottom: 12,
  },
  keystoreText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    letterSpacing: 0.5,
  },
});
