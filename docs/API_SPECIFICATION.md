# Grand Bandhan – REST API & Socket.IO Specification

## Base URL
- Development: `http://localhost:4000/api`
- Production: `https://api.grandbandhan.com/api` (Render)

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/login` | Public | Validates credentials, sets HTTP-only cookie, returns JWT and user payload |
| `POST` | `/register` | Public | Registers a new agency and admin user |
| `GET` | `/me` | Authenticated | Retrieves current authenticated user context |
| `POST` | `/logout` | Public | Clears session cookies |
| `POST` | `/portal-link` | Authenticated | Generates a time-bounded, scoped access token for clients or vendors |

---

## 2. Customer Enquiries (`/api/enquiries`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Public / Auth | Submits a new wedding enquiry with Bride/Groom side selection |
| `GET` | `/` | Agency Team | Lists all enquiries filtered by agency |
| `GET` | `/:id` | Agency Team | Retrieves a specific enquiry record |
| `PATCH` | `/:id/status`| Agency Team | Updates enquiry pipeline status and follow-up date |
| `POST` | `/:id/convert`| Agency Team | Converts enquiry into a confirmed Wedding with digital agreement |

---

## 3. Wedding Projects (`/api/weddings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | Lists weddings with task progress and agreement status |
| `GET` | `/:id` | Authenticated | Retrieves full wedding workspace |
| `POST` | `/` | Planners / Admins | Creates wedding, generates agreement & 25+ auto tasks |
| `PATCH` | `/:id` | Planners / Admins | Updates wedding parameters or execution status |

---

## 4. Digital Agreements (`/api/agreements`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/:weddingId` | Public / Token | Retrieves agreement document and signing terms |
| `POST` | `/:weddingId/sign` | Client / Token | Digitally signs agreement with canvas drawing & audit log |

---

## 5 Quotation Engine (`/api/quotations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/?weddingId=:id` | Authenticated | Lists all quotation requests for a wedding |
| `GET` | `/:id/comparison` | Public / Token | Returns side-by-side comparison matrix with plate calculations |
| `POST` | `/` | Planners / Admins | Floats an RFP inviting multiple vendors |
| `POST` | `/:requestId/quotes`| Vendor / Token | Submits sealed quotation with price per plate and menu scope |
| `POST` | `/:requestId/select`| Couple / Admin | Awards winning vendor and auto-closes competitor quotes |

---

## 6. Instant Task Planning (`/api/tasks`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/?weddingId=:id` | Authenticated | Lists all wedding tasks with lead times and priority tags |
| `POST` | `/` | Authenticated | Creates a custom task |
| `PATCH` | `/:id` | Authenticated | Updates task status (`TO_PLAN`, `IN_PROGRESS`, `BLOCKED`, `DONE`) |
| `POST` | `/regenerate` | Planners / Admins | Re-computes 25+ tasks dynamically from wedding date |

---

## 7. Live Timeline & Gate Arrivals (`/api/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/?weddingId=:id` | Authenticated | Retrieves day-of schedule and vendor arrival logs |
| `POST` | `/` | Authenticated | Adds an event to the wedding timeline |
| `PATCH` | `/:id/status` | Authenticated | Updates event status and broadcasts live via Socket.IO |
| `POST` | `/:eventId/arrivals/:vendorId` | Authenticated | Logs vendor loading dock arrival and delay minutes |

---

## 8. Service Verification System (`/api/verifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/?weddingId=:id` | Authenticated | Lists verification checks for scheduled services |
| `POST` | `/trigger` | Authenticated | Schedules a verification trigger |
| `POST` | `/:id/respond` | Client / Staff | Submits response (Completed, Incomplete, Not Delivered, Issue) |
| `POST` | `/:id/vendor-response`| Vendor | Logs vendor rebuttal and corrective action notes |
| `POST` | `/:id/resolve` | Admin / Client | Records final mutual resolution or dispute penalty |

---

## 9. Payments & Settlement (`/api/payments` & `/api/settlements`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payments?weddingId=:id` | Authenticated | Retrieves milestone disbursements and vendor ledger |
| `POST` | `/api/payments` | Authenticated | Creates a payment milestone |
| `POST` | `/api/payments/:id/transactions` | Authenticated | Records verified payment with bank reference number |
| `GET` | `/api/settlements/:weddingId` | Authenticated | Retrieves post-wedding financial reconciliation |
| `POST` | `/api/settlements/:weddingId` | Authenticated | Calculates plate/hour overages and reconciles final P&L |

---

## 10. Real-Time Socket.IO Events

| Event Key | Direction | Payload |
|---|---|---|
| `join:wedding` | Client → Server | `weddingId: string` |
| `leave:wedding` | Client → Server | `weddingId: string` |
| `event:status_changed` | Server → Room | `{ eventId, status, notes }` |
| `vendor:arrival_updated` | Server → Room | `{ eventId, vendorId, arrivalStatus, delayMinutes }` |
| `service:verification_triggered`| Server → Room | `{ verificationId, serviceName }` |
| `service:verification_updated` | Server → Room | `{ verificationId, status, response }` |
| `task:status_updated` | Server → Room | `{ taskId, status }` |
| `payment:recorded` | Server → Room | `{ paymentId, amount, status }` |
