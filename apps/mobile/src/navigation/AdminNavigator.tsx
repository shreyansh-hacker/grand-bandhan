import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../types/navigation';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { EnquiriesScreen, WeddingsScreen, PaymentsScreen } from '../screens/business';
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Desk',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👑</Text>,
        }}
      />
      <Tab.Screen
        name="AdminEnquiries"
        component={EnquiriesScreen}
        options={{
          tabBarLabel: 'Leads CRM',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💌</Text>,
        }}
      />
      <Tab.Screen
        name="AdminWeddings"
        component={WeddingsScreen}
        options={{
          tabBarLabel: 'Weddings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏰</Text>,
        }}
      />
      <Tab.Screen
        name="AdminSettlements"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Escrow',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="AdminHealth"
        component={ApiHealthScreen}
        options={{
          tabBarLabel: 'Telemetry',
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
