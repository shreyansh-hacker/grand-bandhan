import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UserRole } from '@grand-bandhan/shared';

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
      orderBy: { rating: 'desc' },
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
      },
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
