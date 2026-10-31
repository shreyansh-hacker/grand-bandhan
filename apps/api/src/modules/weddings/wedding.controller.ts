import { Response } from 'express';
import { DataStore } from '../store';
import { createWeddingSchema, updateWeddingSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { WeddingStatus } from '@grand-bandhan/shared';
import { generateInstantWeddingPlan } from '../tasks/task.service';

export function listWeddings(req: AuthenticatedRequest, res: Response): void {
  const agencyId = req.user?.agencyId;
  const weddings = DataStore.weddings.list(agencyId);

  // Hydrate with planner info, agreement status, task completion percentage
  const enriched = weddings.map((w) => {
    const agreement = DataStore.agreements.findByWeddingId(w.id);
    const tasks = DataStore.tasks.listByWedding(w.id);
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const planner = w.plannerId ? DataStore.users.findById(w.plannerId) : null;
    const payments = DataStore.payments.listByWedding(w.id);
    const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    return {
      ...w,
      agreementStatus: agreement?.status || 'NOT_GENERATED',
      tasksCount: tasks.length,
      tasksCompleted: completedTasks,
      tasksProgress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
      plannerName: planner?.name || 'Unassigned',
      totalPaid,
    };
  });

  res.json({ success: true, data: enriched });
}

export function getWeddingById(req: AuthenticatedRequest, res: Response): void {
  const wedding = DataStore.weddings.findById(String(req.params.id));
  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const agreement = DataStore.agreements.findByWeddingId(wedding.id);
  const tasks = DataStore.tasks.listByWedding(wedding.id);
  const events = DataStore.events.listByWedding(wedding.id);
  const quotationRequests = DataStore.quotationRequests.listByWedding(wedding.id);
  const awardedVendors = DataStore.weddingVendors.listByWedding(wedding.id).map((wv) => {
    const vendor = DataStore.vendors.findById(wv.vendorId);
    return { ...wv, vendor };
  });
  const verifications = DataStore.verifications.listByWedding(wedding.id);
  const payments = DataStore.payments.listByWedding(wedding.id);
  const settlement = DataStore.settlements.findByWeddingId(wedding.id);
  const planner = wedding.plannerId ? DataStore.users.findById(wedding.plannerId) : null;

  res.json({
    success: true,
    data: {
      ...wedding,
      planner,
      agreement,
      tasks,
      events,
      quotationRequests,
      awardedVendors,
      verifications,
      payments,
      settlement,
    },
  });
}

export function createWedding(req: AuthenticatedRequest, res: Response): void {
  const parsed = createWeddingSchema.parse(req.body);
  const agencyId = req.user?.agencyId || 'default-agency';

  const wedding = DataStore.weddings.create({
    agencyId,
    brideName: parsed.brideName,
    groomName: parsed.groomName,
    clientEmail: parsed.clientEmail,
    clientPhone: parsed.clientPhone,
    weddingDate: new Date(parsed.weddingDate).toISOString(),
    endDate: parsed.endDate ? new Date(parsed.endDate).toISOString() : null,
    location: parsed.location,
    guestCount: parsed.guestCount,
    budgetMin: parsed.budgetMin,
    budgetMax: parsed.budgetMax,
    packageType: parsed.packageType,
    status: WeddingStatus.CONFIRMED,
    plannerId: parsed.plannerId || req.user?.userId || null,
    notes: parsed.notes || null,
  });

  // Generate Digital Agreement
  DataStore.agreements.create({
    weddingId: wedding.id,
    termsContent: `GRAND BANDHAN WEDDING SERVICES AGREEMENT\n\nParties: Grand Bandhan Luxury Weddings & ${wedding.brideName} and ${wedding.groomName}\nPackage: ${wedding.packageType}\nDate: ${new Date(wedding.weddingDate).toLocaleDateString()}\nLocation: ${wedding.location}\nGuest Guarantee: ${wedding.guestCount} guests\nBudget Range: INR ${wedding.budgetMin.toLocaleString()} - INR ${wedding.budgetMax.toLocaleString()}\n\nExecution Scope:\n- Full coordination of vendors, timelines, event flow, and service verifications.\n- Transparent quotation comparisons for vendor selection.\n- Dedicated day-of operations and digital milestone tracking.\n\nPayment Structure:\n1. 25% Initial Booking Advance upon signing.\n2. 50% Milestone Disbursement 30 days before event.\n3. 25% Final Settlement post wedding including reconciliation of extra guests/hours.`,
  });

  // Create default payment milestones
  const depositAmount = (wedding.budgetMin * 0.25);
  const advanceAmount = (wedding.budgetMin * 0.50);
  const finalAmount = (wedding.budgetMin * 0.25);

  DataStore.payments.create({
    weddingId: wedding.id,
    milestoneName: 'BOOKING_DEPOSIT',
    amount: depositAmount,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '25% Booking Deposit to lock wedding date and initiate instant planning',
  });

  DataStore.payments.create({
    weddingId: wedding.id,
    milestoneName: 'ADVANCE_PAYMENT',
    amount: advanceAmount,
    dueDate: new Date(new Date(wedding.weddingDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '50% Advance for vendor bookings and production procurement',
  });

  DataStore.payments.create({
    weddingId: wedding.id,
    milestoneName: 'FINAL_PAYMENT',
    amount: finalAmount,
    dueDate: new Date(new Date(wedding.weddingDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '25% Post-wedding settlement balance',
  });

  // Automatically trigger Instant Wedding Planning (generates 25+ relevant tasks)
  const tasks = generateInstantWeddingPlan(wedding.id, wedding.weddingDate, wedding.packageType);

  DataStore.auditLogs.create({
    agencyId,
    action: 'WEDDING_CREATED',
    entity: 'Wedding',
    entityId: wedding.id,
    details: { code: wedding.weddingCode, couple: `${wedding.brideName} & ${wedding.groomName}`, tasksGenerated: tasks.length },
  });

  res.status(201).json({
    success: true,
    data: wedding,
    message: `Wedding project initialized with ${tasks.length} instant planning tasks and payment milestones.`,
  });
}

export function updateWedding(req: AuthenticatedRequest, res: Response): void {
  const parsed = updateWeddingSchema.parse(req.body);
  const wedding = DataStore.weddings.update(String(req.params.id), parsed);

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  res.json({ success: true, data: wedding });
}
