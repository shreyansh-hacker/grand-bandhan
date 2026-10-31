# Grand Bandhan — Neon PostgreSQL Database Persistence Migration Report

## 1. Executive Summary & Problem Analysis

In previous audit reviews, a critical architectural vulnerability was identified in the Grand Bandhan backend: **12 out of 13 backend controllers relied on an ephemeral, file-based JSON store (`localDb` / `DataStore`)**.

While convenient for local development, this design failed catastrophically in cloud production environments:
1. **Render Ephemeral Filesystem:** On platforms like Render and Railway, container restarts, git pushes, or inactivity sleep cycles immediately erased the local filesystem, resulting in 100% data loss for client enquiries, wedding schedules, tasks, and payments.
2. **Lack of ACID Transactions:** Multi-entity operations—such as converting an enquiry to a wedding while simultaneously generating 26 dynamic tasks and creating payment milestones—were not executed atomically.
3. **Absence of Tenant Isolation:** Query filtering was performed in-memory using JavaScript `.filter()`, lacking true database indexing and row-level tenant security.

**Resolution:** The backend has been comprehensively re-engineered to execute **100% of data access and mutations through Prisma Client against a managed Neon PostgreSQL cloud database**.

---

## 2. Infrastructure & Connection Topology

- **Database Engine:** PostgreSQL 18.6 (x86_64) on Neon Serverless Cloud
- **Region:** AWS Singapore (`ap-southeast-1`)
- **Host:** `ep-summer-mode-a1kenfdw.ap-southeast-1.aws.neon.tech`
- **Schema Name:** `public`
- **Active Branch:** `production`
- **ORM:** Prisma Client v6.19.3
- **Connection Mode:** SSL required (`sslmode=require`), connection pooled

---

## 3. Migration Inventory — Controller by Controller

Every single backend controller has been systematically transitioned from `DataStore` to direct `prisma.<model>` calls:

| Module / Controller | Previous State | Migrated Neon Prisma Models | Transactional Scope |
| :--- | :--- | :--- | :--- |
| **`auth.controller.ts`** | `DataStore.users` | `prisma.user`, `prisma.agency` | Login approval verification, password hash verification, account activation |
| **`agency.controller.ts`** | *New Module* | `prisma.agency`, `prisma.user` | **Atomic `prisma.$transaction`** creating Agency + Initial Agency Admin |
| **`profile.controller.ts`** | *New Module* | `prisma.user`, `prisma.notificationPreference` | Self-service profile updates, password rehashing, preference upsert |
| **`enquiry.controller.ts`** | `DataStore.enquiries` | `prisma.customerEnquiry` | Public reference generation (`GB-ENQ-YYYY-XXXX`), planner assignment, status update |
| **`wedding.controller.ts`** | `DataStore.weddings` | `prisma.wedding`, `prisma.paymentSchedule`, `prisma.task` | **Atomic `prisma.$transaction`** converting enquiry ➔ wedding with 26 auto tasks |
| **`proposals.controller.ts`** | *New Module* | `prisma.weddingProposal`, `prisma.customerEnquiry` | **Atomic `prisma.$transaction`** recording proposal acceptance & enquiry update |
| **`task.controller.ts`** & `task.service.ts` | `DataStore.tasks` | `prisma.task` | Auto-generation of 26 tasks with dynamic lead times calculated from wedding date |
| **`quotation.controller.ts`** | `DataStore.quotations` | `prisma.quotationRequest`, `prisma.vendorQuotation` | 3-way vendor comparison tables and quote selection |
| **`event.controller.ts`** | `DataStore.events` | `prisma.weddingEvent`, `prisma.vendorArrival` | Live day-of schedule and vendor arrival logging |
| **`verification.controller.ts`** | `DataStore.verifications` | `prisma.serviceVerificationTrigger`, `prisma.serviceVerificationIssue` | Real-time service checks and issue dispute resolution |
| **`payment.controller.ts`** | `DataStore.payments` | `prisma.paymentSchedule`, `prisma.paymentTransaction` | Milestone creation, transaction recording, and balance updates |
| **`settlement.controller.ts`** | `DataStore.settlements` | `prisma.weddingSettlement` | Final post-wedding financial reconciliation matching verified bills |
| **`vendor.controller.ts`** | `DataStore.vendors` | `prisma.vendor` | Verified vendor registry and rating maintenance |
| **`agreement.controller.ts`** | `DataStore.agreements` | `prisma.digitalAgreement` | Digital contract e-signature storage with client IP audit trail |
| **`analytics.controller.ts`** | `DataStore.*` aggregation | `prisma.wedding`, `prisma.paymentSchedule`, `prisma.customerEnquiry` | Live database aggregate functions (`count`, `sum`, `groupBy`) |
| **`notification.controller.ts`** | *New Module* | `prisma.emailLog` | Transactional outbox querying and failed message retry tracking |
| **`storage.controller.ts`** | `prisma.mediaItem` (existing) | `prisma.mediaItem` | Preserved existing persistent media registry |

---

## 4. Multi-Tenant Query Scoping Pattern

To ensure strict multi-tenant isolation, controllers enforce the following pattern across all operations:

```typescript
// Tenant Isolation Pattern in Controllers
const agencyId = req.user?.agencyId;
const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;

const whereClause: any = {};
if (!isSuperAdmin) {
  whereClause.agencyId = agencyId;
}

const records = await prisma.wedding.findMany({
  where: whereClause,
  include: { ... },
  orderBy: { createdAt: 'desc' },
});
```

---

## 5. Dynamic Instant Task Generation Logic

The `generateInstantWeddingPlan` service (`apps/api/src/modules/tasks/task.service.ts`) dynamically seeds tasks into the Neon database based on the wedding date:

```typescript
export async function generateInstantWeddingPlan(
  weddingId: string,
  weddingDateStr: string | Date,
  packageType: WeddingPackageType,
  dbClient: any = prisma
): Promise<any[]> {
  const weddingDate = new Date(weddingDateStr);
  const templates = packageType === WeddingPackageType.PARTIAL_DAY_OF
    ? PARTIAL_DAY_OF_TASK_TEMPLATES
    : FULL_SERVICE_TASK_TEMPLATES;

  // Clear previous auto-generated tasks
  await dbClient.task.deleteMany({
    where: { weddingId, isAutoGenerated: true },
  });

  const tasksToCreate = templates.map((tmpl) => {
    const deadlineTime = weddingDate.getTime() - tmpl.leadTimeDaysBeforeWedding * 24 * 60 * 60 * 1000;
    return {
      weddingId,
      title: tmpl.title,
      category: tmpl.category,
      description: tmpl.description,
      deadline: new Date(deadlineTime),
      leadTimeDays: tmpl.leadTimeDaysBeforeWedding,
      priority: tmpl.priority,
      status: TaskStatus.TO_PLAN,
      isAutoGenerated: true,
    };
  });

  await dbClient.task.createMany({ data: tasksToCreate });
  return dbClient.task.findMany({ where: { weddingId }, orderBy: { deadline: 'asc' } });
}
```

---

## 6. Verification and Durability Guarantee

With this migration complete:
1. **Zero Data Loss on Cloud Restarts:** Render can restart, rebuild, or scale instances at will without affecting any customer enquiry, wedding project, quotation comparison, or payment milestone.
2. **ACID Transaction Guarantees:** Critical workflows are protected by PostgreSQL transactions with rollback safety.
3. **Audit Trail Integrity:** System events and emails are immutably logged in `AuditLog` and `EmailLog` tables with millisecond timestamps.
