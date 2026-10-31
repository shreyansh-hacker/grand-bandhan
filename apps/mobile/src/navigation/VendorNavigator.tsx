import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { VendorTabParamList } from '../types/navigation';
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { QuotationsScreen, TimelineScreen, PaymentsScreen } from '../screens/business';
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
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{
          tabBarLabel: 'Portal',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🤝</Text>,
        }}
      />
      <Tab.Screen
        name="VendorQuotations"
        component={QuotationsScreen}
        options={{
          tabBarLabel: 'Quotes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚖️</Text>,
        }}
      />
      <Tab.Screen
        name="VendorArrival"
        component={TimelineScreen}
        options={{
          tabBarLabel: 'Arrivals',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📡</Text>,
        }}
      />
      <Tab.Screen
        name="VendorSettlements"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Payouts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text>,
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
