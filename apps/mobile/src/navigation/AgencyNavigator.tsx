import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgencyTabParamList } from '../types/navigation';
import { AgencyDashboardScreen } from '../screens/agency/AgencyDashboardScreen';
import { EnquiriesScreen, WeddingsScreen, PaymentsScreen } from '../screens/business';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<AgencyTabParamList>();

export const AgencyNavigator: React.FC = () => {
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
        name="AgencyDashboard"
        component={AgencyDashboardScreen}
        options={{
          tabBarLabel: 'Agency Desk',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏛️</Text>,
        }}
      />
      <Tab.Screen
        name="AgencyEnquiries"
        component={EnquiriesScreen}
        options={{
          tabBarLabel: 'Leads CRM',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💌</Text>,
        }}
      />
      <Tab.Screen
        name="AgencyWeddings"
        component={WeddingsScreen}
        options={{
          tabBarLabel: 'Weddings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏰</Text>,
        }}
      />
      <Tab.Screen
        name="AgencySettlements"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Escrow',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="AgencyProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
