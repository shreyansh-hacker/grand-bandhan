import { randomUUID } from 'crypto';
import { localDb } from '../db';

// Helper to generate UUIDs
export function genId(): string {
  return randomUUID();
}

export const DataStore = {
  // Agencies
  agencies: {
    findFirst: (predicate: (a: any) => boolean) => localDb.get('agencies').find(predicate) || null,
    findById: (id: string) => localDb.get('agencies').find((a) => a.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('agencies');
      list.push(item);
      localDb.set('agencies', list);
      return item;
    },
    list: () => localDb.get('agencies'),
  },

  // Users
  users: {
    findByEmail: (email: string) => localDb.get('users').find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
    findById: (id: string) => localDb.get('users').find((u) => u.id === id) || null,
    list: (predicate?: (u: any) => boolean) => {
      const list = localDb.get('users');
      return predicate ? list.filter(predicate) : list;
    },
    create: (data: any) => {
      const item = { id: genId(), isActive: true, tokenVersion: 1, createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('users');
      list.push(item);
      localDb.set('users', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('users');
      const idx = list.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('users', list);
      return list[idx];
    },
  },

  // Enquiries
  enquiries: {
    list: (agencyId?: string) => {
      const list = localDb.get('enquiries');
      return agencyId ? list.filter((e) => e.agencyId === agencyId) : list;
    },
    findById: (id: string) => localDb.get('enquiries').find((e) => e.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
      const list = localDb.get('enquiries');
      list.unshift(item);
      localDb.set('enquiries', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('enquiries');
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('enquiries', list);
      return list[idx];
    },
  },

  // Weddings
  weddings: {
    list: (agencyId?: string) => {
      const list = localDb.get('weddings');
      return agencyId ? list.filter((w) => w.agencyId === agencyId) : list;
    },
    findById: (id: string) => localDb.get('weddings').find((w) => w.id === id) || null,
    create: (data: any) => {
      const item = {
        id: genId(),
        weddingCode: `GB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      const list = localDb.get('weddings');
      list.unshift(item);
      localDb.set('weddings', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('weddings');
      const idx = list.findIndex((w) => w.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('weddings', list);
      return list[idx];
    },
  },

  // Agreements
  agreements: {
    findByWeddingId: (weddingId: string) => localDb.get('agreements').find((a) => a.weddingId === weddingId) || null,
    findById: (id: string) => localDb.get('agreements').find((a) => a.id === id) || null,
    create: (data: any) => {
      const item = {
        id: genId(),
        agreementNumber: `AGR-${Date.now().toString().slice(-6)}`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        ...data,
      };
      const list = localDb.get('agreements');
      list.push(item);
      localDb.set('agreements', list);
      return item;
    },
    update: (weddingId: string, updates: any) => {
      const list = localDb.get('agreements');
      const idx = list.findIndex((a) => a.weddingId === weddingId);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('agreements', list);
      return list[idx];
    },
  },

  // Vendors
  vendors: {
    list: (agencyId?: string) => {
      const list = localDb.get('vendors');
      return agencyId ? list.filter((v) => v.agencyId === agencyId) : list;
    },
    findById: (id: string) => localDb.get('vendors').find((v) => v.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), rating: 4.9, isApproved: true, createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('vendors');
      list.push(item);
      localDb.set('vendors', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('vendors');
      const idx = list.findIndex((v) => v.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('vendors', list);
      return list[idx];
    },
  },

  // Quotation Requests
  quotationRequests: {
    listByWedding: (weddingId: string) => localDb.get('quotationRequests').filter((q) => q.weddingId === weddingId),
    findById: (id: string) => localDb.get('quotationRequests').find((q) => q.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), status: 'INVITED', createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('quotationRequests');
      list.push(item);
      localDb.set('quotationRequests', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('quotationRequests');
      const idx = list.findIndex((q) => q.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('quotationRequests', list);
      return list[idx];
    },
  },

  // Vendor Quotations
  quotations: {
    listByRequest: (quotationRequestId: string) =>
      localDb.get('quotations').filter((q) => q.quotationRequestId === quotationRequestId),
    findById: (id: string) => localDb.get('quotations').find((q) => q.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), status: 'SUBMITTED', submittedAt: new Date().toISOString(), ...data };
      const list = localDb.get('quotations');
      list.push(item);
      localDb.set('quotations', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('quotations');
      const idx = list.findIndex((q) => q.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      localDb.set('quotations', list);
      return list[idx];
    },
  },

  // Wedding Vendors (awarded)
  weddingVendors: {
    listByWedding: (weddingId: string) => localDb.get('weddingVendors').filter((w) => w.weddingId === weddingId),
    create: (data: any) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('weddingVendors');
      list.push(item);
      localDb.set('weddingVendors', list);
      return item;
    },
  },

  // Tasks
  tasks: {
    listByWedding: (weddingId: string) => localDb.get('tasks').filter((t) => t.weddingId === weddingId),
    findById: (id: string) => localDb.get('tasks').find((t) => t.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), status: 'TO_PLAN', createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('tasks');
      list.push(item);
      localDb.set('tasks', list);
      return item;
    },
    createMany: (items: any[]) => {
      const list = localDb.get('tasks');
      const created = items.map((data) => ({
        id: genId(),
        status: 'TO_PLAN',
        createdAt: new Date().toISOString(),
        ...data,
      }));
      list.push(...created);
      localDb.set('tasks', list);
      return created;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('tasks');
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('tasks', list);
      return list[idx];
    },
    deleteByWedding: (weddingId: string) => {
      const list = localDb.get('tasks').filter((t) => t.weddingId !== weddingId);
      localDb.set('tasks', list);
    },
  },

  // Events & Timeline
  events: {
    listByWedding: (weddingId: string) =>
      localDb.get('events').filter((e) => e.weddingId === weddingId).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    findById: (id: string) => localDb.get('events').find((e) => e.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), status: 'SCHEDULED', createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('events');
      list.push(item);
      localDb.set('events', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('events');
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('events', list);
      return list[idx];
    },
  },

  // Vendor Arrivals
  arrivals: {
    listByEvent: (eventTimelineId: string) => localDb.get('arrivals').filter((a) => a.eventTimelineId === eventTimelineId),
    upsert: (eventTimelineId: string, vendorId: string, data: any) => {
      const list = localDb.get('arrivals');
      const idx = list.findIndex((a) => a.eventTimelineId === eventTimelineId && a.vendorId === vendorId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
        localDb.set('arrivals', list);
        return list[idx];
      }
      const item = { id: genId(), eventTimelineId, vendorId, updatedAt: new Date().toISOString(), ...data };
      list.push(item);
      localDb.set('arrivals', list);
      return item;
    },
  },

  // Service Verification
  verifications: {
    listByWedding: (weddingId: string) => localDb.get('verifications').filter((v) => v.weddingId === weddingId),
    findById: (id: string) => localDb.get('verifications').find((v) => v.id === id) || null,
    create: (data: any) => {
      const item = {
        id: genId(),
        status: 'AWAITING_CONFIRMATION',
        auditHistory: [{ action: 'INITIALIZED', timestamp: new Date().toISOString(), details: 'Verification trigger scheduled' }],
        createdAt: new Date().toISOString(),
        ...data,
      };
      const list = localDb.get('verifications');
      list.push(item);
      localDb.set('verifications', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('verifications');
      const idx = list.findIndex((v) => v.id === id);
      if (idx === -1) return null;
      const current = list[idx];
      const history = current.auditHistory || [];
      if (updates.response || updates.vendorResponseNotes || updates.status) {
        history.push({
          action: updates.status || 'UPDATED',
          timestamp: new Date().toISOString(),
          updates,
        });
      }
      list[idx] = { ...current, ...updates, auditHistory: history, updatedAt: new Date().toISOString() };
      localDb.set('verifications', list);
      return list[idx];
    },
  },

  // Payments
  payments: {
    listByWedding: (weddingId: string) => localDb.get('payments').filter((p) => p.weddingId === weddingId),
    findById: (id: string) => localDb.get('payments').find((p) => p.id === id) || null,
    create: (data: any) => {
      const item = { id: genId(), paidAmount: 0, status: 'PENDING', createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('payments');
      list.push(item);
      localDb.set('payments', list);
      return item;
    },
    update: (id: string, updates: any) => {
      const list = localDb.get('payments');
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localDb.set('payments', list);
      return list[idx];
    },
  },

  // Settlements
  settlements: {
    findByWeddingId: (weddingId: string) => localDb.get('settlements').find((s) => s.weddingId === weddingId) || null,
    upsert: (weddingId: string, data: any) => {
      const list = localDb.get('settlements');
      const idx = list.findIndex((s) => s.weddingId === weddingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
        localDb.set('settlements', list);
        return list[idx];
      }
      const item = { id: genId(), weddingId, status: 'PENDING', createdAt: new Date().toISOString(), ...data };
      list.push(item);
      localDb.set('settlements', list);
      return item;
    },
  },

  // Feedbacks
  feedbacks: {
    listByWedding: (weddingId: string) => localDb.get('feedbacks').filter((f) => f.weddingId === weddingId),
    create: (data: any) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('feedbacks');
      list.push(item);
      localDb.set('feedbacks', list);
      return item;
    },
  },

  // Audit Logs
  auditLogs: {
    create: (data: any) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), ...data };
      const list = localDb.get('auditLogs');
      list.unshift(item);
      localDb.set('auditLogs', list);
      return item;
    },
    list: (agencyId?: string) => {
      const list = localDb.get('auditLogs');
      return agencyId ? list.filter((a) => a.agencyId === agencyId) : list;
    },
  },
};
