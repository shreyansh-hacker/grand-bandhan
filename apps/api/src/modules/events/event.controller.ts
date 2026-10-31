import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { createEventSchema, updateArrivalStatusSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { broadcastWeddingUpdate } from '../../socket';
import { SOCKET_EVENTS, EventStatus, ArrivalStatus, UserRole } from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function listEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId query parameter is required' });
    return;
  }

  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { agencyId: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const events = await prisma.eventTimeline.findMany({
      where: { weddingId },
      include: {
        arrivals: {
          include: { vendor: true },
        },
        responsibleStaff: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createEventSchema.parse(req.body);

    const wedding = await prisma.wedding.findUnique({
      where: { id: parsed.weddingId },
      select: { agencyId: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const event = await prisma.eventTimeline.create({
      data: {
        weddingId: parsed.weddingId,
        title: parsed.title,
        startTime: new Date(parsed.startTime),
        endTime: new Date(parsed.endTime),
        location: parsed.location,
        responsibleUserId: parsed.responsibleUserId || null,
        status: EventStatus.SCHEDULED,
        notes: parsed.notes || null,
      },
    });

    broadcastWeddingUpdate(parsed.weddingId, SOCKET_EVENTS.EVENT_STATUS_CHANGED, { event });
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateEventStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status, notes } = req.body;
  try {
    const existing = await prisma.eventTimeline.findUnique({
      where: { id },
      include: { wedding: { select: { agencyId: true } } },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && existing.wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const event = await prisma.eventTimeline.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    broadcastWeddingUpdate(event.weddingId, SOCKET_EVENTS.EVENT_STATUS_CHANGED, { event });
    res.json({ success: true, data: event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateVendorArrival(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventId = String(req.params.eventId);
  const vendorId = String(req.params.vendorId);
  try {
    const parsed = updateArrivalStatusSchema.parse(req.body);

    const event = await prisma.eventTimeline.findUnique({
      where: { id: eventId },
      include: { wedding: { select: { agencyId: true, weddingCode: true } } },
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    const arrival = await prisma.eventVendorArrival.upsert({
      where: {
        eventTimelineId_vendorId: {
          eventTimelineId: eventId,
          vendorId,
        },
      },
      update: {
        arrivalStatus: parsed.arrivalStatus,
        actualArrivalTime:
          parsed.actualArrivalTime || (parsed.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME ? new Date() : null),
        delayMinutes: parsed.delayMinutes || 0,
        notes: parsed.notes || null,
      },
      create: {
        eventTimelineId: eventId,
        vendorId,
        expectedTime: event.startTime,
        arrivalStatus: parsed.arrivalStatus,
        actualArrivalTime:
          parsed.actualArrivalTime || (parsed.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME ? new Date() : null),
        delayMinutes: parsed.delayMinutes || 0,
        notes: parsed.notes || null,
      },
    });

    broadcastWeddingUpdate(event.weddingId, SOCKET_EVENTS.VENDOR_ARRIVAL_UPDATED, {
      eventId,
      vendorId,
      vendorName: vendor.name,
      arrival,
    });

    // If arrival is delayed, emit alert notification
    if (parsed.arrivalStatus === ArrivalStatus.DELAYED || parsed.arrivalStatus === ArrivalStatus.NO_SHOW) {
      await NotificationService.emit(NotificationEvent.VENDOR_ARRIVAL_DELAYED, {
        agencyId: event.wedding.agencyId,
        recipientEmail: vendor.email,
        recipientName: vendor.name,
        recipientRole: 'VENDOR',
        data: {
          vendorName: vendor.name,
          eventTitle: event.title,
          status: parsed.arrivalStatus,
          delayMinutes: parsed.delayMinutes || 'Unknown',
          notes: parsed.notes || 'Arrived late at gate checkpoint',
        },
      });
    }

    res.json({ success: true, data: { ...arrival, vendor } });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}
