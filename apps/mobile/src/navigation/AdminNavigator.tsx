import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../types/navigation';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ApiHealthScreen } from '../screens/common/ApiHealthScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminNavigator: React.FC = () => {
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👑</Text>,
        }}
      />
      <Tab.Screen
        name="AdminHealth"
        component={ApiHealthScreen}
        options={{
          tabBarLabel: 'Health & DB',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
