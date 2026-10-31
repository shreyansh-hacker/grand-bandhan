import { Response } from 'express';
import { DataStore } from '../store';
import { createEventSchema, updateArrivalStatusSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { broadcastWeddingUpdate } from '../../socket';
import { SOCKET_EVENTS, EventStatus, ArrivalStatus } from '@grand-bandhan/shared';

export function listEvents(req: AuthenticatedRequest, res: Response): void {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId query parameter is required' });
    return;
  }

  const events = DataStore.events.listByWedding(weddingId);
  const enriched = events.map((e) => {
    const arrivals = DataStore.arrivals.listByEvent(e.id).map((a) => {
      const vendor = DataStore.vendors.findById(a.vendorId);
      return { ...a, vendor };
    });
    const staff = e.responsibleUserId ? DataStore.users.findById(e.responsibleUserId) : null;
    return { ...e, arrivals, responsibleStaff: staff };
  });

  res.json({ success: true, data: enriched });
}

export function createEvent(req: AuthenticatedRequest, res: Response): void {
  const parsed = createEventSchema.parse(req.body);
  const event = DataStore.events.create({
    weddingId: parsed.weddingId,
    title: parsed.title,
    startTime: new Date(parsed.startTime).toISOString(),
    endTime: new Date(parsed.endTime).toISOString(),
    location: parsed.location,
    responsibleUserId: parsed.responsibleUserId || null,
    status: EventStatus.SCHEDULED,
    notes: parsed.notes || null,
  });

  broadcastWeddingUpdate(parsed.weddingId, SOCKET_EVENTS.EVENT_STATUS_CHANGED, { event });
  res.status(201).json({ success: true, data: event });
}

export function updateEventStatus(req: AuthenticatedRequest, res: Response): void {
  const id = String(req.params.id);
  const { status, notes } = req.body;

  const event = DataStore.events.update(id, {
    status,
    ...(notes ? { notes } : {}),
  });

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found' });
    return;
  }

  broadcastWeddingUpdate(event.weddingId, SOCKET_EVENTS.EVENT_STATUS_CHANGED, { event });
  res.json({ success: true, data: event });
}

export function updateVendorArrival(req: AuthenticatedRequest, res: Response): void {
  const eventId = String(req.params.eventId);
  const vendorId = String(req.params.vendorId);
  const parsed = updateArrivalStatusSchema.parse(req.body);

  const event = DataStore.events.findById(eventId);
  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found' });
    return;
  }

  const arrival = DataStore.arrivals.upsert(eventId, vendorId, {
    arrivalStatus: parsed.arrivalStatus,
    actualArrivalTime:
      parsed.actualArrivalTime || (parsed.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME ? new Date().toISOString() : null),
    delayMinutes: parsed.delayMinutes || 0,
    notes: parsed.notes || null,
  });

  const vendor = DataStore.vendors.findById(vendorId);

  broadcastWeddingUpdate(event.weddingId, SOCKET_EVENTS.VENDOR_ARRIVAL_UPDATED, {
    eventId,
    vendorId,
    vendorName: vendor?.name,
    arrival,
  });

  res.json({ success: true, data: arrival });
}
