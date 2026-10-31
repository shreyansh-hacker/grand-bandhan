import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserRole } from '@grand-bandhan/shared';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { AdminNavigator } from './AdminNavigator';
import { AgencyNavigator } from './AgencyNavigator';
import { PlannerNavigator } from './PlannerNavigator';
import { CoordinatorNavigator } from './CoordinatorNavigator';
import { VendorNavigator } from './VendorNavigator';
import { ClientNavigator } from './ClientNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
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
