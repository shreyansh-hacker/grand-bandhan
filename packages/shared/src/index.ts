// Grand Bandhan Shared Definitions & Contracts

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  WEDDING_PLANNER = 'WEDDING_PLANNER',
  COORDINATOR = 'COORDINATOR',
  VENDOR = 'VENDOR',
  CLIENT = 'CLIENT',
}

export enum EnquirySource {
  WEBSITE = 'WEBSITE',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  PHONE = 'PHONE',
  MANUAL = 'MANUAL',
}

export enum PlanningForSide {
  BRIDE_SIDE = 'BRIDE_SIDE',
  GROOM_SIDE = 'GROOM_SIDE',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

export enum EnquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CONSULTATION_SCHEDULED = 'CONSULTATION_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum AgreementStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

export enum WeddingPackageType {
  FULL_SERVICE = 'FULL_SERVICE',
  PARTIAL_DAY_OF = 'PARTIAL_DAY_OF',
}

export enum WeddingStatus {
  ENQUIRY = 'ENQUIRY',
  PROPOSAL = 'PROPOSAL',
  CONFIRMED = 'CONFIRMED',
  IN_PLANNING = 'IN_PLANNING',
  EXECUTION = 'EXECUTION',
  COMPLETED = 'COMPLETED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

export enum VendorCategory {
  CATERING = 'CATERING',
  DECORATION = 'DECORATION',
  DJ_MUSIC = 'DJ_MUSIC',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  MAKEUP_ARTIST = 'MAKEUP_ARTIST',
  FLORIST = 'FLORIST',
  VENUE = 'VENUE',
  TRANSPORTATION = 'TRANSPORTATION',
  CHOREOGRAPHY = 'CHOREOGRAPHY',
  MEHENDI_ARTIST = 'MEHENDI_ARTIST',
  OTHER = 'OTHER',
}

export enum QuotationRequestStatus {
  DRAFT = 'DRAFT',
  INVITED = 'INVITED',
  COMPARING = 'COMPARING',
  AWARDED = 'AWARDED',
  CLOSED = 'CLOSED',
}

export enum QuotationStatus {
  SUBMITTED = 'SUBMITTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TO_PLAN = 'TO_PLAN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

export enum ArrivalStatus {
  PENDING = 'PENDING',
  ARRIVED_ON_TIME = 'ARRIVED_ON_TIME',
  DELAYED = 'DELAYED',
  NO_SHOW = 'NO_SHOW',
}

export enum ServiceVerificationStatus {
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
  VENDOR_RESPONDED = 'VENDOR_RESPONDED',
  UNDER_RESOLUTION = 'UNDER_RESOLUTION',
  RESOLVED = 'RESOLVED',
  DISPUTED = 'DISPUTED',
}

export enum VerificationResponse {
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  NOT_DELIVERED = 'NOT_DELIVERED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
}

export enum PaymentType {
  CLIENT_MILESTONE = 'CLIENT_MILESTONE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
  ADDITIONAL_EXPENSE = 'ADDITIONAL_EXPENSE',
}

export enum PaymentMilestone {
  BOOKING_DEPOSIT = 'BOOKING_DEPOSIT',
  ADVANCE_PAYMENT = 'ADVANCE_PAYMENT',
  STAGE_PAYMENT = 'STAGE_PAYMENT',
  FINAL_PAYMENT = 'FINAL_PAYMENT',
  OVERAGE_EXPENSE = 'OVERAGE_EXPENSE',
  VENDOR_DISBURSEMENT = 'VENDOR_DISBURSEMENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  REVIEW = 'REVIEW',
  SETTLED = 'SETTLED',
}

export interface JwtPayload {
  userId: string;
  agencyId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    agencyId: string;
    phone?: string | null;
  };
  accessToken: string;
}

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_WEDDING: 'join:wedding',
  LEAVE_WEDDING: 'leave:wedding',
  EVENT_STATUS_CHANGED: 'event:status_changed',
  VENDOR_ARRIVAL_UPDATED: 'vendor:arrival_updated',
  SERVICE_VERIFICATION_TRIGGERED: 'service:verification_triggered',
  SERVICE_VERIFICATION_UPDATED: 'service:verification_updated',
  TASK_STATUS_UPDATED: 'task:status_updated',
  PAYMENT_RECORDED: 'payment:recorded',
} as const;
