-- AlterEnum EnquiryStatus
ALTER TYPE "EnquiryStatus" ADD VALUE IF NOT EXISTS 'CONSULTATION_COMPLETED';

-- AlterEnum AgreementStatus
ALTER TYPE "AgreementStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
ALTER TYPE "AgreementStatus" ADD VALUE IF NOT EXISTS 'VERIFIED';
ALTER TYPE "AgreementStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- CreateEnum ConsultationType
DO $$ BEGIN
  CREATE TYPE "ConsultationType" AS ENUM ('ONLINE_VIDEO', 'IN_PERSON');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum ConsultationStatus
DO $$ BEGIN
  CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable DigitalAgreement
ALTER TABLE "DigitalAgreement" ALTER COLUMN "weddingId" DROP NOT NULL;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "enquiryId" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "signedPdfUrl" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "partner2SignedByName" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "partner2SignedAt" TIMESTAMP(3);
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "agencySignedByName" TEXT;
ALTER TABLE "DigitalAgreement" ADD COLUMN IF NOT EXISTS "agencySignedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "DigitalAgreement_enquiryId_idx" ON "DigitalAgreement"("enquiryId");

DO $$ BEGIN
  ALTER TABLE "DigitalAgreement" ADD CONSTRAINT "DigitalAgreement_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "CustomerEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable WeddingConsultation
CREATE TABLE IF NOT EXISTS "WeddingConsultation" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "weddingId" TEXT,
    "agencyId" TEXT NOT NULL,
    "plannerId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "meetingType" "ConsultationType" NOT NULL DEFAULT 'ONLINE_VIDEO',
    "meetingLink" TEXT,
    "meetingLocation" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "clientPreferredTime" TEXT,
    "meetingNotes" TEXT,
    "coupleVision" TEXT,
    "themePreferences" TEXT,
    "guestCountConfirmed" INTEGER,
    "budgetDiscussed" DOUBLE PRECISION,
    "venuePreferences" TEXT,
    "specialRequirements" TEXT,
    "familyExpectations" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingConsultation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WeddingConsultation_enquiryId_idx" ON "WeddingConsultation"("enquiryId");
CREATE INDEX IF NOT EXISTS "WeddingConsultation_agencyId_idx" ON "WeddingConsultation"("agencyId");
CREATE INDEX IF NOT EXISTS "WeddingConsultation_plannerId_idx" ON "WeddingConsultation"("plannerId");

DO $$ BEGIN
  ALTER TABLE "WeddingConsultation" ADD CONSTRAINT "WeddingConsultation_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "CustomerEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "WeddingConsultation" ADD CONSTRAINT "WeddingConsultation_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "WeddingConsultation" ADD CONSTRAINT "WeddingConsultation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "WeddingConsultation" ADD CONSTRAINT "WeddingConsultation_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable AgreementTemplate
CREATE TABLE IF NOT EXISTS "AgreementTemplate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgreementTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgreementTemplate_agencyId_idx" ON "AgreementTemplate"("agencyId");

DO $$ BEGIN
  ALTER TABLE "AgreementTemplate" ADD CONSTRAINT "AgreementTemplate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
