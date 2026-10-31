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
  AgencyStaff: undefined;
  AgencyProfile: undefined;
};

// Wedding Planner Tabs
export type PlannerTabParamList = {
  PlannerDashboard: undefined;
  PlannerWeddings: undefined;
  PlannerTasks: undefined;
  PlannerQuotations: undefined;
  PlannerEvents: undefined;
  PlannerProfile: undefined;
};

// Coordinator Tabs
export type CoordinatorTabParamList = {
  CoordinatorDashboard: undefined;
  CoordinatorTimeline: undefined;
  CoordinatorArrivals: undefined;
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
  ClientOverview: undefined;
  ClientQuotations: undefined;
  ClientApprovals: undefined;
  ClientProfile: undefined;
};

// Root Navigator Param List
export type RootStackParamList = {
  Login: undefined;
  SuperAdminRoot: NavigatorScreenParams<AdminTabParamList>;
  AgencyAdminRoot: NavigatorScreenParams<AgencyTabParamList>;
  WeddingPlannerRoot: NavigatorScreenParams<PlannerTabParamList>;
  CoordinatorRoot: NavigatorScreenParams<CoordinatorTabParamList>;
  VendorRoot: NavigatorScreenParams<VendorTabParamList>;
  ClientRoot: NavigatorScreenParams<ClientTabParamList>;
};
