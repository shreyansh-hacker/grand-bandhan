import { Response } from 'express';
import { DataStore } from '../store';
import { AuthenticatedRequest } from '../../middleware/auth';

export function listVendors(req: AuthenticatedRequest, res: Response): void {
  const agencyId = req.user?.agencyId;
  const category = req.query.category as string;
  let list = DataStore.vendors.list(agencyId);

  if (category) {
    list = list.filter((v) => v.category === category);
  }

  res.json({ success: true, data: list });
}

export function getVendorById(req: AuthenticatedRequest, res: Response): void {
  const vendor = DataStore.vendors.findById(String(req.params.id));
  if (!vendor) {
    res.status(404).json({ success: false, message: 'Vendor not found' });
    return;
  }
  res.json({ success: true, data: vendor });
}

export function createVendor(req: AuthenticatedRequest, res: Response): void {
  const agencyId = req.user?.agencyId || 'default-agency';
  const { name, category, contactPerson, email, phone, address, pricingModel, basePrice } = req.body;

  if (!name || !category || !email || !phone) {
    res.status(400).json({ success: false, message: 'Name, category, email, and phone are required' });
    return;
  }

  const vendor = DataStore.vendors.create({
    agencyId,
    name,
    category,
    contactPerson: contactPerson || name,
    email,
    phone,
    address: address || null,
    pricingModel: pricingModel || 'PER_EVENT',
    basePrice: Number(basePrice) || 0,
  });

  res.status(201).json({ success: true, data: vendor });
}
