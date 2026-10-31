import { NavigatorScreenParams } from '@react-navigation/native';

// Common Screens Params
export type CommonScreensParamList = {
  Profile: undefined;
  ApiHealth: undefined;
};

// Super Admin Tabs
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminEnquiries: undefined;
  AdminWeddings: undefined;
  AdminSettlements: undefined;
  AdminHealth: undefined;
  AdminProfile: undefined;
};

// Agency Admin Tabs
export type AgencyTabParamList = {
  AgencyDashboard: undefined;
  AgencyEnquiries: undefined;
  AgencyWeddings: undefined;
  AgencySettlements: undefined;
  AgencyProfile: undefined;
};

// Wedding Planner Tabs
export type PlannerTabParamList = {
  PlannerDashboard: undefined;
  PlannerWeddings: undefined;
  PlannerTasks: undefined;
  PlannerQuotations: undefined;
  PlannerProfile: undefined;
};

// Coordinator Tabs
export type CoordinatorTabParamList = {
  CoordinatorDashboard: undefined;
  CoordinatorTimeline: undefined;
  CoordinatorVerifications: undefined;
  CoordinatorProfile: undefined;
};

// Vendor Tabs
export type VendorTabParamList = {
  VendorDashboard: undefined;
  VendorQuotations: undefined;
  VendorArrival: undefined;
  VendorSettlements: undefined;
  VendorProfile: undefined;
};

// Client Tabs
export type ClientTabParamList = {
  ClientDashboard: undefined;
  ClientQuotations: undefined;
  ClientPayments: undefined;
  ClientProfile: undefined;
};

// Root Navigator Param List
export type RootStackParamList = {
  Login: undefined;
  Register: { defaultRole?: 'CLIENT' | 'VENDOR' } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
  SuperAdminRoot: NavigatorScreenParams<AdminTabParamList>;
  AgencyAdminRoot: NavigatorScreenParams<AgencyTabParamList>;
  WeddingPlannerRoot: NavigatorScreenParams<PlannerTabParamList>;
  CoordinatorRoot: NavigatorScreenParams<CoordinatorTabParamList>;
  VendorRoot: NavigatorScreenParams<VendorTabParamList>;
  ClientRoot: NavigatorScreenParams<ClientTabParamList>;
};
