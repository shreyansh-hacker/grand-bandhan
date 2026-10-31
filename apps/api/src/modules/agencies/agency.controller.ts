import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { registerAgencySchema, agencyStatusUpdateSchema } from '@grand-bandhan/validation';
import { hashPassword } from '../../utils/hash';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UserRole, AgencyStatus, AccountStatus } from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

// Slug generator
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Public Agency Registration with Atomic Prisma Transaction
 */
export async function registerAgency(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerAgencySchema.parse(req.body);

    // 1. Check duplicate user email
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase().trim() },
    });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this business email is already registered.',
      });
      return;
    }

    // 2. Generate and verify unique slug
    let baseSlug = slugify(parsed.agencyName);
    if (!baseSlug) baseSlug = `agency-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.agency.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const passwordHash = await hashPassword(parsed.password);

    // 3. Execute Atomic Transaction: Agency + Initial Admin User
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: parsed.agencyName.trim(),
          slug,
          contactEmail: parsed.email.toLowerCase().trim(),
          contactPhone: parsed.phone.trim(),
          ownerName: parsed.ownerName.trim(),
          address: parsed.address.trim(),
          city: parsed.city.trim(),
          state: parsed.state.trim(),
          country: parsed.country || 'India',
          website: parsed.website || null,
          gstin: parsed.gstin || null,
          businessDescription: parsed.businessDescription || null,
          status: AgencyStatus.PENDING_APPROVAL,
        },
      });

      const user = await tx.user.create({
        data: {
          agencyId: agency.id,
          name: parsed.ownerName.trim(),
          email: parsed.email.toLowerCase().trim(),
          phone: parsed.phone.trim(),
          passwordHash,
          role: UserRole.AGENCY_ADMIN,
          accountStatus: AccountStatus.PENDING_APPROVAL,
          isActive: false, // Inactive until Super Admin approval
        },
      });

      await tx.notificationPreference.create({
        data: {
          userId: user.id,
          transactionalEmails: true,
          weddingUpdates: true,
          paymentAlerts: true,
          taskAlerts: true,
          marketingEmails: false,
        },
      });

      return { agency, user };
    });

    // 4. Emit Notification Event
    await NotificationService.emit(NotificationEvent.AGENCY_REGISTERED, {
      agencyId: result.agency.id,
      agencyName: result.agency.name,
      recipientEmail: result.user.email,
      recipientName: result.user.name,
      recipientRole: 'AGENCY_ADMIN',
      data: {
        agencyName: result.agency.name,
        ownerName: result.agency.ownerName,
        city: result.agency.city,
        state: result.agency.state,
      },
    });

    // Notify Super Admin of pending review
    try {
      const superAdmins = await prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN, isActive: true },
        select: { email: true, name: true },
      });
      const superAdminEmails = superAdmins.length > 0
        ? superAdmins.map((sa) => sa.email)
        : [process.env.GMAIL_SENDER_EMAIL || 'admin@grandbandhan.com'];

      for (const saEmail of superAdminEmails) {
        await NotificationService.emit(NotificationEvent.AGENCY_SUBMITTED_FOR_APPROVAL, {
          recipientEmail: saEmail,
          recipientName: 'Imperial Super Admin',
          recipientRole: 'SUPER_ADMIN',
          data: {
            agencyName: result.agency.name,
            ownerName: result.agency.ownerName || result.user.name,
            email: result.user.email,
            phone: result.agency.contactPhone,
            city: result.agency.city,
            state: result.agency.state,
          },
        });
      }
    } catch (saErr: any) {
      console.warn('[Agency] Could not notify Super Admin:', saErr.message);
    }

    res.status(201).json({
      success: true,
      status: AgencyStatus.PENDING_APPROVAL,
      data: {
        agency: {
          id: result.agency.id,
          name: result.agency.name,
          slug: result.agency.slug,
          status: result.agency.status,
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      message: 'Agency registration submitted successfully. Your account is pending Super Admin approval.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Agency registration error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error registering agency.' });
  }
}

/**
 * Super Admin: List all agency applications
 */
export async function listAgencyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const status = req.query.status as string;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const agencies = await prisma.agency.findMany({
      where,
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, accountStatus: true, phone: true },
        },
        _count: {
          select: { weddings: true, enquiries: true, vendors: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: agencies,
      total: agencies.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Super Admin: Approve, Reject, or Suspend Agency
 */
export async function updateAgencyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = agencyStatusUpdateSchema.parse(req.body);

    const agency = await prisma.agency.findUnique({
      where: { id },
      include: { users: { where: { role: UserRole.AGENCY_ADMIN } } },
    });

    if (!agency) {
      res.status(404).json({ success: false, message: 'Agency not found' });
      return;
    }

    const adminUser = agency.users[0];

    // Transactional Status Mutation
    const updatedAgency = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: parsed.status,
        rejectionReason: parsed.rejectionReason || null,
      };

      if (parsed.status === AgencyStatus.APPROVED) {
        updateData.approvedAt = new Date();
        // Activate Agency Admin
        if (adminUser) {
          await tx.user.update({
            where: { id: adminUser.id },
            data: { accountStatus: AccountStatus.ACTIVE, isActive: true },
          });
        }
      } else if (parsed.status === AgencyStatus.SUSPENDED) {
        updateData.suspendedAt = new Date();
        // Suspend all agency users
        await tx.user.updateMany({
          where: { agencyId: id },
          data: { accountStatus: AccountStatus.SUSPENDED, isActive: false },
        });
      }

      return tx.agency.update({
        where: { id },
        data: updateData,
      });
    });

    // Emit event
    if (adminUser) {
      if (parsed.status === AgencyStatus.APPROVED) {
        await NotificationService.emit(NotificationEvent.AGENCY_APPROVED, {
          agencyId: agency.id,
          agencyName: agency.name,
          recipientEmail: adminUser.email,
          recipientName: adminUser.name,
          data: {
            agencyName: agency.name,
            ownerName: agency.ownerName || adminUser.name,
            email: adminUser.email,
          },
        });
      } else if (parsed.status === AgencyStatus.REJECTED) {
        await NotificationService.emit(NotificationEvent.AGENCY_REJECTED, {
          agencyId: agency.id,
          agencyName: agency.name,
          recipientEmail: adminUser.email,
          recipientName: adminUser.name,
          data: {
            agencyName: agency.name,
            ownerName: agency.ownerName || adminUser.name,
            rejectionReason: parsed.rejectionReason,
          },
        });
      } else if (parsed.status === AgencyStatus.SUSPENDED) {
        await NotificationService.emit(NotificationEvent.AGENCY_SUSPENDED, {
          agencyId: agency.id,
          agencyName: agency.name,
          recipientEmail: adminUser.email,
          recipientName: adminUser.name,
          recipientRole: 'AGENCY_ADMIN',
          data: {
            agencyName: agency.name,
            ownerName: agency.ownerName || adminUser.name,
            reason: parsed.rejectionReason || 'Administrative compliance review',
          },
        });
      }
    }

    res.json({
      success: true,
      data: updatedAgency,
      message: `Agency ${agency.name} status updated to ${parsed.status}.`,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Agency Admin: Fetch own agency profile
 */
export async function getMyAgency(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        _count: {
          select: { users: true, weddings: true, enquiries: true, vendors: true },
        },
      },
    });

    if (!agency) {
      res.status(404).json({ success: false, message: 'Agency record not found' });
      return;
    }

    res.json({ success: true, data: agency });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Agency Admin: Update own agency details
 */
export async function updateMyAgency(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const { name, contactPhone, address, city, state, website, gstin, businessDescription, logoUrl } = req.body;

    const updated = await prisma.agency.update({
      where: { id: agencyId },
      data: {
        ...(name && { name }),
        ...(contactPhone && { contactPhone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(website !== undefined && { website }),
        ...(gstin !== undefined && { gstin }),
        ...(businessDescription !== undefined && { businessDescription }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Agency profile updated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Agency Admin: List users belonging to this agency
 */
export async function listAgencyUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = (isSuperAdmin && req.query.agencyId as string) || req.user?.agencyId;

    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const users = await prisma.user.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        isActive: true,
        department: true,
        specialization: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Agency Admin: Invite / Create internal user (Planner, Coordinator, Staff)
 */
export async function createAgencyUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = (isSuperAdmin && req.body.agencyId) || req.user?.agencyId;

    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const { name, email, password, role, phone, department, specialization } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }

    // Prohibit regular agency admins from creating Super Admins
    const targetRole = role || UserRole.COORDINATOR;
    if (targetRole === UserRole.SUPER_ADMIN && !isSuperAdmin) {
      res.status(403).json({ success: false, message: 'Cannot assign Super Admin role' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(400).json({ success: false, message: 'A user with this email already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        agencyId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: targetRole,
        phone: phone || null,
        department: department || null,
        specialization: specialization || null,
        accountStatus: AccountStatus.ACTIVE,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        department: true,
        specialization: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: `User ${user.name} (${user.role}) successfully created in agency.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Agency Admin: Update agency user role or status
 */
export async function updateAgencyUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.params.userId as string;
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!isSuperAdmin && user.agencyId !== agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const { role, accountStatus, isActive, name, phone, department, specialization } = req.body;

    if (role === UserRole.SUPER_ADMIN && !isSuperAdmin) {
      res.status(403).json({ success: false, message: 'Cannot assign Super Admin role' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(accountStatus && { accountStatus }),
        ...(isActive !== undefined && { isActive }),
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(specialization !== undefined && { specialization }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        isActive: true,
        department: true,
        specialization: true,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'User details updated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
