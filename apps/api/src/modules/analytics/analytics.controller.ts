import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { WeddingStatus, TaskStatus, ArrivalStatus, PaymentStatus, UserRole, ServiceVerificationStatus } from '@grand-bandhan/shared';

export async function getExecutiveAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const whereAgency: any = {};
    if (!isSuperAdmin) {
      if (!agencyId) {
        res.status(403).json({ success: false, message: 'Agency context missing' });
        return;
      }
      whereAgency.agencyId = agencyId;
    }

    const [weddings, enquiries, vendors, tasks, payments, arrivals, verifications] = await Promise.all([
      prisma.wedding.findMany({ where: whereAgency }),
      prisma.customerEnquiry.findMany({ where: whereAgency }),
      prisma.vendor.findMany({ where: whereAgency }),
      prisma.task.findMany({
        where: isSuperAdmin ? {} : { wedding: { agencyId } },
      }),
      prisma.payment.findMany({
        where: isSuperAdmin ? {} : { wedding: { agencyId } },
      }),
      prisma.eventVendorArrival.findMany({
        where: isSuperAdmin ? {} : { eventTimeline: { wedding: { agencyId } } },
      }),
      prisma.serviceVerification.findMany({
        where: isSuperAdmin ? {} : { wedding: { agencyId } },
      }),
    ]);

    // Counts
    const totalWeddings = weddings.length;
    const activeWeddings = weddings.filter(
      (w) => w.status === WeddingStatus.CONFIRMED || w.status === WeddingStatus.IN_PLANNING || w.status === WeddingStatus.EXECUTION
    ).length;
    const upcomingWeddings = weddings.filter((w) => new Date(w.weddingDate) > new Date()).length;
    const completedWeddings = weddings.filter(
      (w) => w.status === WeddingStatus.COMPLETED || w.status === WeddingStatus.SETTLED
    ).length;

    // Tasks
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.TO_PLAN || t.status === TaskStatus.IN_PROGRESS).length;
    const delayedTasks = tasks.filter(
      (t) => (t.status === TaskStatus.TO_PLAN || t.status === TaskStatus.IN_PROGRESS) && new Date(t.deadline) < new Date()
    ).length;

    // Vendor Arrivals
    const totalArrivalsLogged = arrivals.length;
    const onTimeArrivals = arrivals.filter((a) => a.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME).length;
    const delayedArrivals = arrivals.filter((a) => a.arrivalStatus === ArrivalStatus.DELAYED).length;
    const onTimeArrivalRate = totalArrivalsLogged > 0 ? Math.round((onTimeArrivals / totalArrivalsLogged) * 100) : 100;

    // Financials
    const clientPayments = payments.filter((p) => p.type === 'CLIENT_MILESTONE');
    const totalRevenue = clientPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const upcomingClientPayments = clientPayments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, p) => sum + p.amount, 0);

    const vendorPayments = payments.filter((p) => p.type === 'VENDOR_PAYMENT');
    const totalExpenses = vendorPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const pendingVendorPayments = vendorPayments
      .filter((p) => p.status !== PaymentStatus.PAID)
      .reduce((sum, p) => sum + (p.amount - (p.paidAmount || 0)), 0);

    const netGrossProfit = totalRevenue - totalExpenses;

    // Wedding-wise breakdown
    const weddingFinancials = weddings.map((w) => {
      const wPayments = payments.filter((p) => p.weddingId === w.id);
      const rev = wPayments.filter((p) => p.type === 'CLIENT_MILESTONE').reduce((s, p) => s + (p.paidAmount || 0), 0);
      const exp = wPayments.filter((p) => p.type === 'VENDOR_PAYMENT').reduce((s, p) => s + (p.paidAmount || 0), 0);
      return {
        id: w.id,
        code: w.weddingCode,
        couple: `${w.brideName} & ${w.groomName}`,
        location: w.location,
        weddingDate: w.weddingDate,
        status: w.status,
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
      };
    });

    // Recent enquiries breakdown
    const brideSideEnquiries = enquiries.filter((e) => e.planningFor === 'BRIDE_SIDE').length;
    const groomSideEnquiries = enquiries.filter((e) => e.planningFor === 'GROOM_SIDE').length;

    res.json({
      success: true,
      data: {
        metrics: {
          totalWeddings,
          activeWeddings,
          upcomingWeddings,
          completedWeddings,
          totalEnquiries: enquiries.length,
          brideSideEnquiries,
          groomSideEnquiries,
          pendingTasks,
          delayedTasks,
          vendorCount: vendors.length,
          onTimeArrivalRate,
          totalRevenue,
          totalExpenses,
          netGrossProfit,
          upcomingClientPayments,
          pendingVendorPayments,
        },
        weddingFinancials,
        recentVerifications: verifications.slice(0, 5),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Phase 5: Admin Command Center Operational Overview
 * Aggregates real live database records across verifications, overdue tasks,
 * delayed vendors, upcoming events, pending payments, complaints, and escalations.
 */
export async function getCommandCenterAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    if (!isSuperAdmin && !agencyId) {
      res.status(403).json({ success: false, message: 'Agency context missing' });
      return;
    }

    const whereAgency: any = isSuperAdmin ? {} : { agencyId };
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [
      pendingVerifications,
      overdueTasks,
      delayedVendors,
      upcomingEvents,
      pendingPayments,
      unresolvedComplaints,
      escalatedVerifications,
    ] = await Promise.all([
      // 1. Pending service verifications awaiting confirmation
      prisma.serviceVerification.findMany({
        where: {
          wedding: whereAgency,
          status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
        },
        include: {
          wedding: { select: { id: true, weddingCode: true, brideName: true, groomName: true } },
          vendor: { select: { id: true, name: true, category: true, phone: true } },
        },
        orderBy: { scheduledConfirmationTime: 'asc' },
        take: 25,
      }),

      // 2. Overdue tasks
      prisma.task.findMany({
        where: {
          wedding: whereAgency,
          status: { not: TaskStatus.DONE },
          deadline: { lt: now },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { deadline: 'asc' },
        take: 25,
      }),

      // 3. Delayed or No-Show vendors
      prisma.eventVendorArrival.findMany({
        where: {
          eventTimeline: { wedding: whereAgency },
          arrivalStatus: { in: [ArrivalStatus.DELAYED, ArrivalStatus.NO_SHOW] },
        },
        include: {
          vendor: { select: { id: true, name: true, category: true, phone: true } },
          eventTimeline: {
            select: {
              id: true,
              title: true,
              startTime: true,
              wedding: { select: { id: true, weddingCode: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),

      // 4. Upcoming wedding ceremony events (next 48h)
      prisma.eventTimeline.findMany({
        where: {
          wedding: whereAgency,
          startTime: { gte: now, lte: in48Hours },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true, brideName: true, groomName: true } },
        },
        orderBy: { startTime: 'asc' },
        take: 25,
      }),

      // 5. Pending milestone payments
      prisma.payment.findMany({
        where: {
          wedding: whereAgency,
          status: PaymentStatus.PENDING,
        },
        include: {
          wedding: { select: { id: true, weddingCode: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 25,
      }),

      // 6. Unresolved complaints / service disputes
      prisma.serviceVerification.findMany({
        where: {
          wedding: whereAgency,
          status: {
            in: [
              ServiceVerificationStatus.ISSUE_REPORTED,
              ServiceVerificationStatus.DISPUTED,
              ServiceVerificationStatus.UNDER_RESOLUTION,
            ],
          },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true } },
          vendor: { select: { id: true, name: true, category: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 25,
      }),

      // 7. Recent escalations (verifications marked with UNANSWERED_ESCALATION)
      prisma.serviceVerification.findMany({
        where: {
          wedding: whereAgency,
          status: { in: [ServiceVerificationStatus.AWAITING_CONFIRMATION, ServiceVerificationStatus.ISSUE_REPORTED] },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true, brideName: true, groomName: true } },
          vendor: { select: { id: true, name: true } },
        },
        take: 50,
      }),
    ]);

    // Filter true escalations from auditHistory
    const filteredEscalations = escalatedVerifications
      .filter((v) => {
        const history = Array.isArray(v.auditHistory) ? (v.auditHistory as any[]) : [];
        return history.some((h) => h.action === 'UNANSWERED_ESCALATION');
      })
      .slice(0, 20);

    const pendingPaymentTotal = pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    res.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        pendingVerificationsCount: pendingVerifications.length,
        overdueTasksCount: overdueTasks.length,
        delayedVendorsCount: delayedVendors.length,
        upcomingEventsCount: upcomingEvents.length,
        pendingPaymentsCount: pendingPayments.length,
        pendingPaymentsSum: pendingPaymentTotal,
        unresolvedComplaintsCount: unresolvedComplaints.length,
        escalationsCount: filteredEscalations.length,
      },
      data: {
        pendingVerifications,
        overdueTasks,
        delayedVendors,
        upcomingEvents,
        pendingPayments,
        unresolvedComplaints,
        escalations: filteredEscalations,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
