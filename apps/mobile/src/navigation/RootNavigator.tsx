import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserRole } from '@grand-bandhan/shared';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from './AdminNavigator';
import { AgencyNavigator } from './AgencyNavigator';
import { PlannerNavigator } from './PlannerNavigator';
import { CoordinatorNavigator } from './CoordinatorNavigator';
import { VendorNavigator } from './VendorNavigator';
import { ClientNavigator } from './ClientNavigator';
import { colors, typography, shadows } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isHydrating, role, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Luxury Hydration Splash Screen
  if (isHydrating) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.imperialNavyDark} />
        <View style={styles.crestCircle}>
          <Text style={styles.crestIcon}>👑</Text>
        </View>
        <Text style={styles.brandTitle}>GRAND BANDHAN</Text>
        <Text style={styles.brandSubtitle}>ROYAL WEDDING OPERATIONS</Text>
        <ActivityIndicator
          size="small"
          color={colors.gold}
          style={styles.spinner}
        />
        <Text style={styles.keystoreText}>Verifying Android Keystore session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : role === UserRole.SUPER_ADMIN ? (
        <Stack.Screen name="SuperAdminRoot" component={AdminNavigator} />
      ) : role === UserRole.AGENCY_ADMIN ? (
        <Stack.Screen name="AgencyAdminRoot" component={AgencyNavigator} />
      ) : role === UserRole.COORDINATOR ? (
        <Stack.Screen name="CoordinatorRoot" component={CoordinatorNavigator} />
      ) : role === UserRole.VENDOR ? (
        <Stack.Screen name="VendorRoot" component={VendorNavigator} />
      ) : role === UserRole.CLIENT ? (
        <Stack.Screen name="ClientRoot" component={ClientNavigator} />
      ) : (
        <Stack.Screen name="WeddingPlannerRoot" component={PlannerNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
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
