import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CoordinatorTabParamList } from '../types/navigation';
import { CoordinatorDashboardScreen } from '../screens/coordinator/CoordinatorDashboardScreen';
import { TimelineScreen, VerificationsScreen } from '../screens/business';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<CoordinatorTabParamList>();

export const CoordinatorNavigator: React.FC = () => {
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
        name="CoordinatorDashboard"
        component={CoordinatorDashboardScreen}
        options={{
          tabBarLabel: 'On-Ground',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="CoordinatorTimeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: 'Timeline & Radar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⏱️</Text>,
        }}
      />
      <Tab.Screen
        name="CoordinatorVerifications"
        component={VerificationsScreen}
        options={{
          tabBarLabel: 'Audits',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="CoordinatorProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
