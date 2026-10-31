import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { VendorTabParamList } from '../types/navigation';
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { ApiHealthScreen } from '../screens/common/ApiHealthScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<VendorTabParamList>();

export const VendorNavigator: React.FC = () => {
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
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{
          tabBarLabel: 'Vendor Portal',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🤝</Text>,
        }}
      />
      <Tab.Screen
        name="VendorQuotations"
        component={ApiHealthScreen}
        options={{
          tabBarLabel: 'System Status',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="VendorProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
