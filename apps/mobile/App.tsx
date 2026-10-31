import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { colors, typography, shadows } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});

function HydrationSplash() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.imperialNavyDark} />
      <View style={styles.crestCircle}>
        <Text style={styles.crestIcon}>👑</Text>
      </View>
      <Text style={styles.brandTitle}>GRAND BANDHAN</Text>
      <Text style={styles.brandSubtitle}>ROYAL WEDDING OPERATIONS</Text>
      <ActivityIndicator size="small" color={colors.gold} style={styles.spinner} />
      <Text style={styles.keystoreText}>Verifying Android Keystore session...</Text>
    </View>
  );
}

function MainAppContent() {
  const { isHydrating, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isHydrating) {
    return <HydrationSplash />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
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
  },
  crestCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.imperialNavy,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.goldGlow,
  },
  crestIcon: {
    fontSize: 40,
  },
  brandTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 4,
  },
  brandSubtitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.goldLight,
    letterSpacing: 2,
    marginTop: 4,
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
