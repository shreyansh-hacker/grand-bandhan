import { Response, Request } from 'express';
import { prisma } from '@grand-bandhan/database';
import { createWeddingSchema, updateWeddingSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { WeddingStatus, WeddingPackageType, UserRole, PaymentMilestone, PaymentType, PaymentStatus, AgreementStatus, AccountStatus, RsvpStatus, PlanningForSide } from '@grand-bandhan/shared';
import { hashPassword } from '../../utils/hash';
import { generateInstantWeddingPlan } from '../tasks/task.service';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function listWeddings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const isClient = req.user?.role === UserRole.CLIENT;
    const agencyId = req.user?.agencyId;

    const where: any = {};
    if (!isSuperAdmin) {
      if (isClient) {
        where.OR = [
          { clientId: req.user?.userId },
          { clientEmail: req.user?.email },
        ];
      } else {
        if (!agencyId) {
          res.status(403).json({ success: false, message: 'Agency context missing' });
          return;
        }
        where.agencyId = agencyId;
      }
    }

    const weddings = await prisma.wedding.findMany({
      where,
      include: {
        planner: { select: { id: true, name: true, email: true, phone: true } },
        agreement: { select: { id: true, status: true, signedByName: true, signedAt: true } },
        tasks: { select: { id: true, status: true } },
        payments: { select: { id: true, amount: true, paidAmount: true, status: true } },
      },
      orderBy: { weddingDate: 'asc' },
    });

    const enriched = weddings.map((w) => {
      const completedTasks = w.tasks.filter((t) => t.status === 'DONE').length;
      const totalPaid = w.payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
      const totalAmount = w.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        ...w,
        agreementStatus: w.agreement?.status || 'NOT_GENERATED',
        tasksCount: w.tasks.length,
        tasksCompleted: completedTasks,
        tasksProgress: w.tasks.length > 0 ? Math.round((completedTasks / w.tasks.length) * 100) : 0,
        plannerName: w.planner?.name || 'Unassigned',
        totalPaid,
        totalAmount,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getWeddingById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id },
      include: {
        planner: { select: { id: true, name: true, email: true, phone: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
        agreement: true,
        tasks: { orderBy: { deadline: 'asc' } },
        events: {
          include: { arrivals: { include: { vendor: true } } },
          orderBy: { startTime: 'asc' },
        },
        quotationRequests: {
          include: { quotations: { include: { vendor: true } } },
        },
        weddingVendors: {
          include: { vendor: true, quotation: true },
        },
        serviceVerifications: {
          include: { vendor: true, confirmedByUser: { select: { name: true } } },
        },
        payments: { orderBy: { dueDate: 'asc' } },
        settlement: true,
      },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    const isClient = req.user?.role === UserRole.CLIENT;
    const isOwnerClient = isClient && (wedding.clientId === req.user?.userId || wedding.clientEmail === req.user?.email);

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId && !isOwnerClient) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: wedding });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createWedding(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createWeddingSchema.parse(req.body);
    const agencyId = req.user?.agencyId;

    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const weddingCode = `GB-W-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const wedding = await prisma.$transaction(async (tx) => {
      const w = await tx.wedding.create({
        data: {
          agencyId,
          weddingCode,
          brideName: parsed.brideName.trim(),
          groomName: parsed.groomName.trim(),
          clientEmail: parsed.clientEmail.toLowerCase().trim(),
          clientPhone: parsed.clientPhone.trim(),
          weddingDate: new Date(parsed.weddingDate),
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
          location: parsed.location.trim(),
          guestCount: parsed.guestCount,
          budgetMin: parsed.budgetMin,
          budgetMax: parsed.budgetMax,
          packageType: parsed.packageType,
          status: WeddingStatus.CONFIRMED,
          plannerId: parsed.plannerId || req.user?.userId || null,
          notes: parsed.notes || null,
        },
      });

      // Digital Agreement
      await tx.digitalAgreement.create({
        data: {
          weddingId: w.id,
          agreementNumber: `GB-AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          termsContent: `GRAND BANDHAN WEDDING SERVICES AGREEMENT\n\nParties: Grand Bandhan Luxury Weddings & ${w.brideName} and ${w.groomName}\nPackage: ${w.packageType}\nDate: ${new Date(w.weddingDate).toLocaleDateString('en-IN')}\nLocation: ${w.location}\nGuest Guarantee: ${w.guestCount} guests\nBudget Range: INR ${w.budgetMin.toLocaleString('en-IN')} - INR ${w.budgetMax.toLocaleString('en-IN')}\n\nExecution Scope:\n- Full coordination of vendors, timelines, event flow, and service verifications.\n- Transparent quotation comparisons for vendor selection.\n- Dedicated day-of operations and digital milestone tracking.\n\nPayment Structure:\n1. 25% Initial Booking Advance upon signing.\n2. 50% Milestone Disbursement 30 days before event.\n3. 25% Final Settlement post wedding including reconciliation of extra guests/hours.`,
          status: AgreementStatus.DRAFT,
        },
      });

      // Payment Milestones
      const depositAmount = w.budgetMin * 0.25;
      const advanceAmount = w.budgetMin * 0.50;
      const finalAmount = w.budgetMin * 0.25;

      await tx.payment.createMany({
        data: [
          {
            weddingId: w.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.BOOKING_DEPOSIT,
            amount: depositAmount,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: PaymentStatus.PENDING,
            notes: '25% Booking Deposit to lock wedding date and initiate instant planning',
          },
          {
            weddingId: w.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.ADVANCE_PAYMENT,
            amount: advanceAmount,
            dueDate: new Date(new Date(w.weddingDate).getTime() - 30 * 24 * 60 * 60 * 1000),
            status: PaymentStatus.PENDING,
            notes: '50% Advance for vendor bookings and production procurement',
          },
          {
            weddingId: w.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.FINAL_PAYMENT,
            amount: finalAmount,
            dueDate: new Date(new Date(w.weddingDate).getTime() + 3 * 24 * 60 * 60 * 1000),
            status: PaymentStatus.PENDING,
            notes: '25% Post-wedding settlement balance',
          },
        ],
      });

      // Generate 26+ tasks
      await generateInstantWeddingPlan(w.id, w.weddingDate, w.packageType as any, tx);

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: req.user?.userId || null,
          action: 'WEDDING_CREATED',
          entity: 'Wedding',
          entityId: w.id,
          details: { weddingCode: w.weddingCode, couple: `${w.brideName} & ${w.groomName}` },
        },
      });

      return w;
    });

    // Emit Booking Confirmed Event
    const appUrl = process.env.APP_URL || 'https://grandbandhan.com';
    const clientPortalUrl = `${appUrl}/portal/client/${wedding.id}`;
    const loginUrl = `${appUrl}/login`;

    await NotificationService.emit(NotificationEvent.BOOKING_CONFIRMED, {
      agencyId,
      recipientEmail: wedding.clientEmail,
      recipientName: `${wedding.brideName} & ${wedding.groomName}`,
      data: {
        weddingCode: wedding.weddingCode,
        coupleNames: `${wedding.brideName} & ${wedding.groomName}`,
        weddingDate: wedding.weddingDate,
        location: wedding.location,
        packageType: wedding.packageType,
      },
    });

    res.status(201).json({
      success: true,
      data: wedding,
      message: 'Wedding project initialized with instant planning blueprint and milestone schedule.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function convertEnquiryToWedding(req: AuthenticatedRequest, res: Response): Promise<void> {
  const enquiryId = (req.body?.enquiryId || req.params?.enquiryId || req.params?.id) as string;
  try {
    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { id: enquiryId },
      include: { agency: true },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && enquiry.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const { packageType, brideName, groomName } = req.body;
    const defaultTempPassword = 'RoyalClient@2026';
    let isNewUser = false;
    const weddingCode = `GB-W-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // Auto-provision Client User in Neon DB if not existing
      const normalizedEmail = enquiry.email.toLowerCase().trim();
      let clientUser = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!clientUser) {
        const passwordHash = await hashPassword(defaultTempPassword);
        clientUser = await tx.user.create({
          data: {
            agencyId: enquiry.agencyId,
            email: normalizedEmail,
            passwordHash,
            role: UserRole.CLIENT,
            name: enquiry.customerName,
            phone: enquiry.phone,
            accountStatus: AccountStatus.ACTIVE,
            isActive: true,
            emailVerified: true,
          },
        });
        isNewUser = true;
      }
      const wedding = await tx.wedding.create({
        data: {
          agencyId: enquiry.agencyId,
          weddingCode,
          brideName: brideName || (enquiry.planningFor === 'BRIDE_SIDE' ? enquiry.customerName : 'Bride'),
          groomName: groomName || (enquiry.planningFor === 'GROOM_SIDE' ? enquiry.customerName : 'Groom'),
          clientEmail: enquiry.email,
          clientPhone: enquiry.phone,
          weddingDate: enquiry.weddingDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          location: enquiry.location,
          guestCount: enquiry.guestCount,
          budgetMin: enquiry.minBudget,
          budgetMax: enquiry.maxBudget,
          packageType: packageType || enquiry.packageType || WeddingPackageType.FULL_SERVICE,
          status: WeddingStatus.CONFIRMED,
          plannerId: enquiry.assignedPlannerId || req.user?.userId || null,
          clientId: clientUser.id,
          notes: enquiry.notes,
        },
      });

      await tx.customerEnquiry.update({
        where: { id: enquiry.id },
        data: {
          status: 'CONVERTED',
          convertedWeddingId: wedding.id,
        },
      });

      await tx.digitalAgreement.create({
        data: {
          weddingId: wedding.id,
          agreementNumber: `GB-AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          termsContent: `SERVICE AGREEMENT FOR WEDDING PLANNING & MANAGEMENT SERVICES\n\nClient: ${wedding.brideName} & ${wedding.groomName}\nPackage: ${wedding.packageType}\nGuest Count: ${wedding.guestCount}\nLocation: ${wedding.location}\n\nTerms & Conditions:\n1. Scope of work encompasses comprehensive wedding planning and day-of execution as agreed.\n2. Payment milestones: 25% booking deposit, 50% advance 30 days prior, 25% post-wedding settlement.\n3. Cancellation policies and vendor terms apply as per signed contracts.`,
          status: AgreementStatus.DRAFT,
        },
      });

      const depositAmount = wedding.budgetMin * 0.25;
      await tx.payment.create({
        data: {
          weddingId: wedding.id,
          type: PaymentType.CLIENT_MILESTONE,
          milestoneName: PaymentMilestone.BOOKING_DEPOSIT,
          amount: depositAmount,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PENDING,
          notes: '25% Booking Deposit',
        },
      });

      const tasks = await generateInstantWeddingPlan(wedding.id, wedding.weddingDate, wedding.packageType as any, tx);

      return { wedding, clientUser, tasksCount: tasks.length };
    });

    const appUrl = process.env.APP_URL || 'https://grandbandhan.com';
    const clientPortalUrl = `${appUrl}/portal/client/${result.wedding.id}`;
    const loginUrl = `${appUrl}/login`;

    await NotificationService.emit(NotificationEvent.BOOKING_CONFIRMED, {
      agencyId: enquiry.agencyId,
      recipientEmail: enquiry.email,
      recipientName: `${result.wedding.brideName} & ${result.wedding.groomName}`,
      recipientRole: 'CLIENT',
      data: {
        weddingCode: result.wedding.weddingCode,
        coupleNames: `${result.wedding.brideName} & ${result.wedding.groomName}`,
        weddingDate: result.wedding.weddingDate,
        location: result.wedding.location,
        packageType: result.wedding.packageType,
        loginEmail: enquiry.email,
        temporaryPassword: isNewUser ? defaultTempPassword : 'Use your existing password',
        isNewUser,
        portalUrl: clientPortalUrl,
        loginUrl,
      },
    }).catch((err) => console.warn('[Wedding] Booking confirmation notification error:', err?.message));

    res.json({
      success: true,
      data: {
        wedding: result.wedding,
        clientUser: {
          id: result.clientUser.id,
          email: result.clientUser.email,
          isNewUser,
          temporaryPassword: isNewUser ? defaultTempPassword : null,
        },
      },
      message: `Enquiry successfully converted to Wedding ${result.wedding.weddingCode}. Client account provisioned with ${result.tasksCount} dynamic tasks initialized.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateWedding(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = updateWeddingSchema.parse(req.body);

    const existing = await prisma.wedding.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && existing.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.wedding.update({
      where: { id },
      data: {
        ...(parsed.brideName && { brideName: parsed.brideName }),
        ...(parsed.groomName && { groomName: parsed.groomName }),
        ...(parsed.weddingDate && { weddingDate: new Date(parsed.weddingDate) }),
        ...(parsed.location && { location: parsed.location }),
        ...(parsed.guestCount && { guestCount: parsed.guestCount }),
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.plannerId !== undefined && { plannerId: parsed.plannerId }),
        ...(parsed.notes !== undefined && { notes: parsed.notes }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}


/**
 * Client Portal Wedding Details (Overview, Events, Payments, Guests, Agreement)
 * Accessible via Wedding ID or Wedding Code
 */
export async function getWeddingPortalDetails(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const wedding = await prisma.wedding.findFirst({
      where: {
        OR: [{ id }, { weddingCode: id }],
      },
      include: {
        planner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
        agreement: true,
        events: {
          orderBy: { startTime: 'asc' },
        },
        payments: {
          orderBy: { dueDate: 'asc' },
        },
        guests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding celebration not found' });
      return;
    }

    // Compute RSVP Statistics
    const guests = wedding.guests || [];
    const attendingCount = guests
      .filter((g) => g.rsvpStatus === 'ATTENDING')
      .reduce((sum, g) => sum + (g.guestCount || 1), 0);
    const declinedCount = guests
      .filter((g) => g.rsvpStatus === 'DECLINED')
      .reduce((sum, g) => sum + (g.guestCount || 1), 0);
    const pendingCount = guests
      .filter((g) => g.rsvpStatus === 'PENDING')
      .reduce((sum, g) => sum + (g.guestCount || 1), 0);

    res.json({
      success: true,
      data: {
        wedding,
        rsvpStats: {
          totalRegisteredGuests: guests.length,
          totalAttendees: attendingCount,
          totalDeclined: declinedCount,
          totalPending: pendingCount,
          targetCapacity: wedding.guestCount,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Wedding Guests
 */
export async function getWeddingGuests(req: Request, res: Response): Promise<void> {
  const weddingId = req.params.id as string;
  try {
    const guests = await prisma.weddingGuest.findMany({
      where: { weddingId },
      orderBy: [{ rsvpStatus: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: guests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Add Wedding Guest
 */
export async function addWeddingGuest(req: Request, res: Response): Promise<void> {
  const weddingId = req.params.id as string;
  try {
    const { fullName, email, phone, side, rsvpStatus, guestCount, dietaryPreference, roomAssigned, notes } = req.body;

    if (!fullName) {
      res.status(400).json({ success: false, message: 'Guest full name is required' });
      return;
    }

    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    const guest = await prisma.weddingGuest.create({
      data: {
        weddingId,
        fullName: String(fullName).trim(),
        email: email ? String(email).trim().toLowerCase() : null,
        phone: phone ? String(phone).trim() : null,
        side: side || 'NOT_SPECIFIED',
        rsvpStatus: rsvpStatus || 'PENDING',
        guestCount: Number(guestCount) || 1,
        dietaryPreference: dietaryPreference ? String(dietaryPreference).trim() : null,
        roomAssigned: roomAssigned ? String(roomAssigned).trim() : null,
        notes: notes ? String(notes).trim() : null,
      },
    });

    res.status(201).json({
      success: true,
      data: guest,
      message: `${guest.fullName} successfully registered on the royal guest list.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update Wedding Guest RSVP or Details
 */
export async function updateWeddingGuest(req: Request, res: Response): Promise<void> {
  const guestId = req.params.guestId as string;
  try {
    const { fullName, email, phone, side, rsvpStatus, guestCount, dietaryPreference, roomAssigned, notes } = req.body;

    const existing = await prisma.weddingGuest.findUnique({ where: { id: guestId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Guest record not found' });
      return;
    }

    const updated = await prisma.weddingGuest.update({
      where: { id: guestId },
      data: {
        ...(fullName && { fullName: String(fullName).trim() }),
        ...(email !== undefined && { email: email ? String(email).trim().toLowerCase() : null }),
        ...(phone !== undefined && { phone: phone ? String(phone).trim() : null }),
        ...(side && { side }),
        ...(rsvpStatus && { rsvpStatus }),
        ...(guestCount !== undefined && { guestCount: Number(guestCount) || 1 }),
        ...(dietaryPreference !== undefined && { dietaryPreference: dietaryPreference ? String(dietaryPreference).trim() : null }),
        ...(roomAssigned !== undefined && { roomAssigned: roomAssigned ? String(roomAssigned).trim() : null }),
        ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Guest RSVP details updated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete Wedding Guest
 */
export async function deleteWeddingGuest(req: Request, res: Response): Promise<void> {
  const guestId = req.params.guestId as string;
  try {
    const existing = await prisma.weddingGuest.findUnique({ where: { id: guestId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Guest record not found' });
      return;
    }

    await prisma.weddingGuest.delete({ where: { id: guestId } });

    res.json({
      success: true,
      message: 'Guest removed from list.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
