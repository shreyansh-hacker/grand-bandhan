import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CoordinatorTabParamList } from '../types/navigation';
import { CoordinatorDashboardScreen } from '../screens/coordinator/CoordinatorDashboardScreen';
import { ApiHealthScreen } from '../screens/common/ApiHealthScreen';
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
        name="CoordinatorDashboard"
        component={CoordinatorDashboardScreen}
        options={{
          tabBarLabel: 'On-Ground',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="CoordinatorTimeline"
        component={ApiHealthScreen}
        options={{
          tabBarLabel: 'System Status',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
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
