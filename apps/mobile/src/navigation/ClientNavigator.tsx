import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClientTabParamList } from '../types/navigation';
import { ClientDashboardScreen } from '../screens/client/ClientDashboardScreen';
import { QuotationsScreen, PaymentsScreen } from '../screens/business';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<ClientTabParamList>();

export const ClientNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.imperialNavyDark,
          borderTopColor: colors.borderGold,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#8E9CAE',
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs - 1,
          fontWeight: typography.fontWeight.semibold,
        },
      }}
    >
      <Tab.Screen
        name="ClientDashboard"
        component={ClientDashboardScreen}
        options={{
          tabBarLabel: 'Lounge',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏰</Text>,
        }}
      />
      <Tab.Screen
        name="ClientQuotations"
        component={QuotationsScreen}
        options={{
          tabBarLabel: '3-Way Quotes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚖️</Text>,
        }}
      />
      <Tab.Screen
        name="ClientPayments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Escrow',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="ClientProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
