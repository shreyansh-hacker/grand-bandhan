import { Response } from 'express';
import { DataStore } from '../store';
import { localDb } from '../../db';
import { AuthenticatedRequest } from '../../middleware/auth';
import { WeddingStatus, TaskStatus, ArrivalStatus, PaymentStatus } from '@grand-bandhan/shared';

export function getExecutiveAnalytics(req: AuthenticatedRequest, res: Response): void {
  const agencyId = req.user?.agencyId;
  const weddings = DataStore.weddings.list(agencyId);
  const enquiries = DataStore.enquiries.list(agencyId);
  const vendors = DataStore.vendors.list(agencyId);
  const tasks = localDb.get('tasks');
  const payments = localDb.get('payments');
  const arrivals = localDb.get('arrivals');
  const verifications = localDb.get('verifications');

  // Counts
  const totalWeddings = weddings.length;
  const activeWeddings = weddings.filter((w) => w.status === WeddingStatus.CONFIRMED || w.status === WeddingStatus.IN_PLANNING || w.status === WeddingStatus.EXECUTION).length;
  const upcomingWeddings = weddings.filter((w) => new Date(w.weddingDate) > new Date()).length;
  const completedWeddings = weddings.filter((w) => w.status === WeddingStatus.COMPLETED || w.status === WeddingStatus.SETTLED).length;

  // Tasks
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.TO_PLAN || t.status === TaskStatus.IN_PROGRESS).length;
  const delayedTasks = tasks.filter((t) => (t.status === TaskStatus.TO_PLAN || t.status === TaskStatus.IN_PROGRESS) && new Date(t.deadline) < new Date()).length;

  // Vendor Arrivals
  const totalArrivalsLogged = arrivals.length;
  const onTimeArrivals = arrivals.filter((a) => a.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME).length;
  const delayedArrivals = arrivals.filter((a) => a.arrivalStatus === ArrivalStatus.DELAYED).length;

  // Financials
  const clientPayments = payments.filter((p) => p.type === 'CLIENT_MILESTONE');
  const totalRevenue = clientPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const upcomingClientPayments = clientPayments.filter((p) => p.status === PaymentStatus.PENDING).reduce((sum, p) => sum + p.amount, 0);

  const vendorPayments = payments.filter((p) => p.type === 'VENDOR_PAYMENT');
  const totalExpenses = vendorPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const pendingVendorPayments = vendorPayments.filter((p) => p.status !== PaymentStatus.PAID).reduce((sum, p) => sum + (p.amount - (p.paidAmount || 0)), 0);

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
        onTimeArrivalRate: totalArrivalsLogged > 0 ? Math.round((onTimeArrivals / totalArrivalsLogged) * 100) : 100,
        delayedArrivals,
        totalRevenue,
        totalExpenses,
        netGrossProfit,
        upcomingClientPayments,
        pendingVendorPayments,
      },
      weddingFinancials,
      recentVerifications: verifications.slice(-5),
    },
  });
}
