-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'AGENCY_ADMIN', 'WEDDING_PLANNER', 'COORDINATOR', 'VENDOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'PHONE', 'MANUAL');

-- CreateEnum
CREATE TYPE "PlanningForSide" AS ENUM ('BRIDE_SIDE', 'GROOM_SIDE', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONSULTATION_SCHEDULED', 'QUALIFIED', 'PROPOSAL_IN_PROGRESS', 'PROPOSAL_SENT', 'NEGOTIATION', 'APPROVED', 'BOOKING_PENDING', 'CONVERTED', 'LOST', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WeddingPackageType" AS ENUM ('FULL_SERVICE', 'PARTIAL_DAY_OF');

-- CreateEnum
CREATE TYPE "WeddingStatus" AS ENUM ('ENQUIRY', 'PROPOSAL', 'CONFIRMED', 'IN_PLANNING', 'EXECUTION', 'COMPLETED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('CATERING', 'DECORATION', 'DJ_MUSIC', 'PHOTOGRAPHY', 'MAKEUP_ARTIST', 'FLORIST', 'VENUE', 'TRANSPORTATION', 'CHOREOGRAPHY', 'MEHENDI_ARTIST', 'OTHER');

-- CreateEnum
CREATE TYPE "QuotationRequestStatus" AS ENUM ('DRAFT', 'INVITED', 'COMPARING', 'AWARDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('SUBMITTED', 'SELECTED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TO_PLAN', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ArrivalStatus" AS ENUM ('PENDING', 'ARRIVED_ON_TIME', 'DELAYED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ServiceVerificationStatus" AS ENUM ('AWAITING_CONFIRMATION', 'CONFIRMED', 'ISSUE_REPORTED', 'VENDOR_RESPONDED', 'UNDER_RESOLUTION', 'RESOLVED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "VerificationResponse" AS ENUM ('COMPLETED', 'INCOMPLETE', 'NOT_DELIVERED', 'ISSUE_REPORTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CLIENT_MILESTONE', 'VENDOR_PAYMENT', 'ADDITIONAL_EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMilestone" AS ENUM ('BOOKING_DEPOSIT', 'ADVANCE_PAYMENT', 'STAGE_PAYMENT', 'FINAL_PAYMENT', 'OVERAGE_EXPENSE', 'VENDOR_DISBURSEMENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'REVIEW', 'SETTLED');

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "ownerName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "website" TEXT,
    "gstin" TEXT,
    "businessDescription" TEXT,
    "rejectionReason" TEXT,
    "status" "AgencyStatus" NOT NULL DEFAULT 'APPROVED',
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "department" TEXT,
    "specialization" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerEnquiry" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "customerName" TEXT NOT NULL,
    "partnerName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredContactMethod" TEXT DEFAULT 'EMAIL',
    "weddingDate" TIMESTAMP(3),
    "isDateFlexible" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 200,
    "theme" TEXT,
    "minBudget" DOUBLE PRECISION NOT NULL DEFAULT 500000,
    "maxBudget" DOUBLE PRECISION NOT NULL DEFAULT 2500000,
    "packageType" "WeddingPackageType",
    "eventsRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servicesRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "EnquirySource" NOT NULL DEFAULT 'WEBSITE',
    "planningFor" "PlanningForSide" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedPlannerId" TEXT,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "convertedWeddingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalAgreement" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "termsContent" TEXT NOT NULL,
    "signedByName" TEXT,
    "signatureDataUrl" TEXT,
    "signatureFileId" TEXT,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "signedAt" TIMESTAMP(3),
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "weddingCode" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 350,
    "budgetMin" DOUBLE PRECISION NOT NULL DEFAULT 1500000,
    "budgetMax" DOUBLE PRECISION NOT NULL DEFAULT 3500000,
    "packageType" "WeddingPackageType" NOT NULL DEFAULT 'FULL_SERVICE',
    "status" "WeddingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "plannerId" TEXT,
    "clientId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingStaff" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleDescription" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "pricingModel" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "portfolioUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationRequest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "guestCount" INTEGER,
    "targetBudget" DOUBLE PRECISION,
    "specifications" TEXT NOT NULL,
    "status" "QuotationRequestStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuotationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorQuotation" (
    "id" TEXT NOT NULL,
    "quotationRequestId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "pricePerPlate" DOUBLE PRECISION,
    "extraHourRate" DOUBLE PRECISION,
    "additionalCosts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "menuDetails" TEXT,
    "includedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "quotationPdfUrl" TEXT,
    "isAgencyRecommended" BOOLEAN NOT NULL DEFAULT false,
    "status" "QuotationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedAt" TIMESTAMP(3),

    CONSTRAINT "VendorQuotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingVendor" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "quotationId" TEXT,
    "agreedAmount" DOUBLE PRECISION NOT NULL,
    "contractStatus" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "deadline" TIMESTAMP(3) NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TO_PLAN',
    "assignedUserId" TEXT,
    "vendorId" TEXT,
    "eventId" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "leadTimeDays" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTimeline" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "responsibleUserId" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVendorArrival" (
    "id" TEXT NOT NULL,
    "eventTimelineId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "expectedTime" TIMESTAMP(3) NOT NULL,
    "arrivalStatus" "ArrivalStatus" NOT NULL DEFAULT 'PENDING',
    "actualArrivalTime" TIMESTAMP(3),
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventVendorArrival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVerification" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "eventTimelineId" TEXT,
    "vendorId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "scheduledConfirmationTime" TIMESTAMP(3) NOT NULL,
    "status" "ServiceVerificationStatus" NOT NULL DEFAULT 'AWAITING_CONFIRMATION',
    "confirmedByUserId" TEXT,
    "response" "VerificationResponse",
    "issueNotes" TEXT,
    "evidencePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vendorResponseNotes" TEXT,
    "auditHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL DEFAULT 'CLIENT_MILESTONE',
    "milestoneName" "PaymentMilestone" NOT NULL DEFAULT 'STAGE_PAYMENT',
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "vendorId" TEXT,
    "paymentMethod" TEXT,
    "transactionRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "agreedTotal" DOUBLE PRECISION NOT NULL,
    "extraGuestCount" INTEGER NOT NULL DEFAULT 0,
    "extraPlatesCount" INTEGER NOT NULL DEFAULT 0,
    "extraPlateCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extraVendorHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extraVendorCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unexpectedExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clientAdditionalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorRemainingDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAgencyProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "settledAt" TIMESTAMP(3),
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetVendorId" TEXT,
    "role" "UserRole" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comments" TEXT NOT NULL,
    "category" TEXT,
    "issueEscalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "uploaderId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingProposal" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "packageType" "WeddingPackageType" NOT NULL DEFAULT 'FULL_SERVICE',
    "proposedServices" JSONB,
    "estimatedBudget" DOUBLE PRECISION NOT NULL,
    "planningScope" TEXT,
    "termsContent" TEXT,
    "paymentMilestones" JSONB,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "customerNotes" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientRole" TEXT,
    "eventType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'SENT',
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "payload" JSONB,
    "idempotencyKey" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReminder" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "reminderType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionalEmails" BOOLEAN NOT NULL DEFAULT true,
    "weddingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "paymentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "taskAlerts" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailOAuthToken" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "agencyId" TEXT,
    "senderEmail" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT,
    "expiryDate" TIMESTAMP(3),
    "scope" TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/gmail.send',
    "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailOAuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "userId" TEXT,
    "agencyId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerEnquiry_referenceNumber_key" ON "CustomerEnquiry"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalAgreement_weddingId_key" ON "DigitalAgreement"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalAgreement_agreementNumber_key" ON "DigitalAgreement"("agreementNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_weddingCode_key" ON "Wedding"("weddingCode");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingStaff_weddingId_userId_key" ON "WeddingStaff"("weddingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingVendor_quotationId_key" ON "WeddingVendor"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingVendor_weddingId_vendorId_key" ON "WeddingVendor"("weddingId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "EventVendorArrival_eventTimelineId_vendorId_key" ON "EventVendorArrival"("eventTimelineId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_weddingId_key" ON "Settlement"("weddingId");

-- CreateIndex
CREATE INDEX "StoredFile_entityType_entityId_idx" ON "StoredFile"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingProposal_proposalNumber_key" ON "WeddingProposal"("proposalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_idempotencyKey_key" ON "EmailLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EmailLog_status_nextRetryAt_idx" ON "EmailLog"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "EmailLog_agencyId_idx" ON "EmailLog"("agencyId");

-- CreateIndex
CREATE INDEX "EmailLog_eventType_idx" ON "EmailLog"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "ScheduledReminder_status_scheduledFor_idx" ON "ScheduledReminder"("status", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledReminder_reminderType_entityType_entityId_key" ON "ScheduledReminder"("reminderType", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthState_state_key" ON "OAuthState"("state");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerEnquiry" ADD CONSTRAINT "CustomerEnquiry_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerEnquiry" ADD CONSTRAINT "CustomerEnquiry_assignedPlannerId_fkey" FOREIGN KEY ("assignedPlannerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalAgreement" ADD CONSTRAINT "DigitalAgreement_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingStaff" ADD CONSTRAINT "WeddingStaff_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingStaff" ADD CONSTRAINT "WeddingStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationRequest" ADD CONSTRAINT "QuotationRequest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorQuotation" ADD CONSTRAINT "VendorQuotation_quotationRequestId_fkey" FOREIGN KEY ("quotationRequestId") REFERENCES "QuotationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorQuotation" ADD CONSTRAINT "VendorQuotation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingVendor" ADD CONSTRAINT "WeddingVendor_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingVendor" ADD CONSTRAINT "WeddingVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingVendor" ADD CONSTRAINT "WeddingVendor_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "VendorQuotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventTimeline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTimeline" ADD CONSTRAINT "EventTimeline_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTimeline" ADD CONSTRAINT "EventTimeline_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVendorArrival" ADD CONSTRAINT "EventVendorArrival_eventTimelineId_fkey" FOREIGN KEY ("eventTimelineId") REFERENCES "EventTimeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVendorArrival" ADD CONSTRAINT "EventVendorArrival_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVerification" ADD CONSTRAINT "ServiceVerification_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVerification" ADD CONSTRAINT "ServiceVerification_eventTimelineId_fkey" FOREIGN KEY ("eventTimelineId") REFERENCES "EventTimeline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVerification" ADD CONSTRAINT "ServiceVerification_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVerification" ADD CONSTRAINT "ServiceVerification_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_targetVendorId_fkey" FOREIGN KEY ("targetVendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingProposal" ADD CONSTRAINT "WeddingProposal_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "CustomerEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingProposal" ADD CONSTRAINT "WeddingProposal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

