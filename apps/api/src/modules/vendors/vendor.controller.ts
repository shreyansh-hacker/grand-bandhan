import { Request, Response } from 'express';
import { prisma, VendorCategory } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UserRole } from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function listVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const where: any = {};
    if (!isSuperAdmin) {
      if (!agencyId) {
        res.status(403).json({ success: false, message: 'Agency context missing' });
        return;
      }
      where.agencyId = agencyId;
    }

    const category = req.query.category as string;
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: [{ isApproved: 'asc' }, { rating: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: vendors });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getVendorById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        quotations: { take: 5, orderBy: { submittedAt: 'desc' } },
        feedbacks: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && vendor.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const { name, category, contactPerson, email, phone, address, pricingModel, basePrice } = req.body;

    if (!name || !category || !email || !phone) {
      res.status(400).json({ success: false, message: 'Name, category, email, and phone are required' });
      return;
    }

    const vendor = await prisma.vendor.create({
      data: {
        agencyId,
        name: String(name).trim(),
        category,
        contactPerson: contactPerson || name,
        email: String(email).toLowerCase().trim(),
        phone: String(phone).trim(),
        address: address || null,
        pricingModel: pricingModel || 'PER_EVENT',
        basePrice: Number(basePrice) || 0,
        isApproved: true,
      },
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Public Vendor Onboarding Application
 * Allows wedding artisans, caterers, photographers & decorators to apply.
 * Automatically saves application as unapproved and dispatches notification to Super Admin.
 */
export async function publicVendorApply(req: Request, res: Response): Promise<void> {
  try {
    const { name, category, contactPerson, email, phone, address, pricingModel, basePrice, portfolioUrls, notes } = req.body;

    if (!name || !category || !email || !phone) {
      res.status(400).json({ success: false, message: 'Business name, category, email, and phone are required' });
      return;
    }

    // Route to primary approved agency
    let agency = await prisma.agency.findFirst({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'asc' } });
    if (!agency) {
      agency = await prisma.agency.findFirst();
    }

    if (!agency) {
      res.status(500).json({ success: false, message: 'No registered agency available to route application.' });
      return;
    }

    const vendor = await prisma.vendor.create({
      data: {
        agencyId: agency.id,
        name: String(name).trim(),
        category: category as VendorCategory,
        contactPerson: String(contactPerson || name).trim(),
        email: String(email).toLowerCase().trim(),
        phone: String(phone).trim(),
        address: address ? String(address).trim() : null,
        pricingModel: pricingModel || 'PER_EVENT',
        basePrice: Number(basePrice) || 0,
        portfolioUrls: Array.isArray(portfolioUrls) ? portfolioUrls : [],
        isApproved: false, // Requires Super Admin approval
      },
    });

    // 1. Notify Super Admin (shreyanshsharma049@gmail.com)
    await NotificationService.emit(NotificationEvent.VENDOR_APPLICATION_RECEIVED, {
      agencyId: agency.id,
      recipientEmail: 'shreyanshsharma049@gmail.com',
      recipientName: 'Shreyansh Sharma',
      recipientRole: 'SUPER_ADMIN',
      subject: `👑 New Vendor Partner Application: ${vendor.name} (${vendor.category})`,
      data: {
        isSuperAdminNotice: true,
        vendorName: vendor.name,
        category: vendor.category,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        basePrice: vendor.basePrice,
        notes,
      },
    }).catch((err) => console.warn('[Vendor] Super Admin notification error:', err?.message));

    // 2. Send Application Received Confirmation to Vendor
    await NotificationService.emit(NotificationEvent.VENDOR_APPLICATION_RECEIVED, {
      agencyId: agency.id,
      recipientEmail: vendor.email,
      recipientName: vendor.contactPerson || vendor.name,
      subject: `👑 Grand Bandhan: Vendor Partnership Application Received (${vendor.name})`,
      data: {
        isSuperAdminNotice: false,
        vendorName: vendor.name,
        category: vendor.category,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
      },
    }).catch((err) => console.warn('[Vendor] Vendor confirmation email error:', err?.message));

    res.status(201).json({
      success: true,
      data: vendor,
      message: 'Vendor application received and dispatched for Super Admin approval.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Approve Vendor Application
 * Accessible to Super Admin and Agency Admin.
 * Updates vendor status and dispatches welcome approval email to vendor.
 */
export async function approveVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const existing = await prisma.vendor.findUnique({
      where: { id },
      include: { agency: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && existing.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: { isApproved: true },
    });

    // Send Approval Email to Vendor
    await NotificationService.emit(NotificationEvent.VENDOR_APPROVED, {
      agencyId: existing.agencyId,
      recipientEmail: existing.email,
      recipientName: existing.contactPerson || existing.name,
      subject: `🎉 Welcome to Grand Bandhan: Your Vendor Partnership is Approved! (${existing.name})`,
      data: {
        vendorName: existing.name,
        category: existing.category,
        contactPerson: existing.contactPerson,
      },
    }).catch((err) => console.warn('[Vendor] Approval email error:', err?.message));

    res.json({
      success: true,
      data: updated,
      message: `Vendor ${existing.name} successfully approved. Confirmation email dispatched.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
