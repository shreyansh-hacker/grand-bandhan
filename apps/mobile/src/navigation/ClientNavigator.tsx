import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClientTabParamList } from '../types/navigation';
import { ClientDashboardScreen } from '../screens/client/ClientDashboardScreen';
import { ApiHealthScreen } from '../screens/common/ApiHealthScreen';
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#8E9CAE',
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        },
      }}
    >
      <Tab.Screen
        name="ClientDashboard"
        component={ClientDashboardScreen}
        options={{
          tabBarLabel: 'Wedding Lounge',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏰</Text>,
        }}
      />
      <Tab.Screen
        name="ClientOverview"
        component={ApiHealthScreen}
        options={{
          tabBarLabel: 'System Status',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
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
