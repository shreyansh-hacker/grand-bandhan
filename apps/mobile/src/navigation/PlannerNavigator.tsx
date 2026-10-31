import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlannerTabParamList } from '../types/navigation';
import { PlannerDashboardScreen } from '../screens/planner/PlannerDashboardScreen';
import { WeddingsScreen, TasksScreen, QuotationsScreen } from '../screens/business';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<PlannerTabParamList>();

export const PlannerNavigator: React.FC = () => {
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
        name="PlannerDashboard"
        component={PlannerDashboardScreen}
        options={{
          tabBarLabel: 'Desk',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💍</Text>,
        }}
      />
      <Tab.Screen
        name="PlannerWeddings"
        component={WeddingsScreen}
        options={{
          tabBarLabel: 'Weddings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏰</Text>,
        }}
      />
      <Tab.Screen
        name="PlannerTasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="PlannerQuotations"
        component={QuotationsScreen}
        options={{
          tabBarLabel: 'Bids 3-Way',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚖️</Text>,
        }}
      />
      <Tab.Screen
        name="PlannerProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
