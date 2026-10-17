# Steadfast Courier Integration — Architecture & Operations Manual

This document details the production-ready, provider-agnostic Steadfast Courier integration implemented in the Rongin Libas haute couture e-commerce platform.

---

## 1. Architectural Overview

The integration follows a decoupled, provider-agnostic domain architecture:

```
[ Admin Dashboard / Client App ]
             │
             ▼
[ AdminCourierController / WebhookController ]
             │
             ▼
      [ ShipmentService ]
             │
             ├─────────────────────────────────────────────────┐
             │                                                 │
             ▼                                                 ▼
     [ Prisma Database ]                              [ CourierProvider ]
   (Shipment & ShipmentEvent)                         (DI Interface Token)
                                                               │
                                               ┌───────────────┴───────────────┐
                                               ▼                               ▼
                                   [ MockSteadfastProvider ]       [ SteadfastCourierProvider ]
                                  (Deterministic Simulation)                   │
                                                                               ▼
                                                                     [ SteadfastApiClient ]
                                                                       (HTTP, Safe Headers)
                                                                               │
                                                                               ▼
                                                                   [ Steadfast Courier Gateway ]
```

### Core Abstractions:
1. **`CourierProvider` Interface**:
   Defines the vendor-neutral contract (`createShipment`, `getStatusByConsignmentId`, `getStatusByInvoice`, `getStatusByTrackingCode`, `getBalance`, `createReturnRequest`, `healthCheck`). Future logistics couriers (RedX, Paperfly, Pathao) can be added seamlessly by implementing this interface without altering order or financial logic.
2. **`Shipment` & `ShipmentEvent` Models**:
   Store shipment consignments, tracking codes, authoritative server-side COD amounts, delivery charges, and full event logs independently from order tables.
3. **Dual Provider Implementations**:
   - `SteadfastCourierProvider`: Live production adapter communicating over authenticated REST calls.
   - `MockSteadfastCourierProvider`: Deterministic in-memory simulation for local development, automated CI testing, and staging environments where sandbox endpoints are unavailable.
4. **Authoritative Order Synchronization**:
   Active shipment details are mirrored onto the `Order` table for backward compatibility, invoice generation, customer tracking steppers, and thermal slip printing.

---

## 2. Environment Variables & Configuration

Configure the following variables in `server/.env`:

| Environment Variable | Required | Default Value | Description |
|---|---|---|---|
| `STEADFAST_ENABLED` | No | `true` | Toggles Steadfast logistics feature availability. |
| `STEADFAST_MODE` | Yes | `mock` | Mode switch: set to `mock` for local dev/testing, or `live` for production. |
| `STEADFAST_BASE_URL` | No | `https://api.steadfast.com.bd/v1` | Merchant-configurable gateway base URL. |
| `STEADFAST_API_KEY` | When `live` | `""` | Steadfast merchant API Key. Stripped from all client responses and logs. |
| `STEADFAST_SECRET_KEY` | When `live` | `""` | Steadfast merchant Secret Key. Strictly validated at startup if `live`. |
| `STEADFAST_TIMEOUT` | No | `10000` | Request timeout in milliseconds (uses `AbortController`). |
| `STEADFAST_WEBHOOK_SECRET` | No | `""` | Secret token verified against `X-Steadfast-Signature` or `X-Webhook-Secret`. |

> **Important**:
> If `STEADFAST_MODE=live`, `STEADFAST_API_KEY` and `STEADFAST_SECRET_KEY` are strictly validated at application startup. In `mock` mode, live credentials are not required.

---

## 3. Mock Mode vs. Live Mode

### Mock Mode (`STEADFAST_MODE=mock`)
- **Zero External Network Dependencies**: Operates completely in-memory using deterministic fixtures.
- **Auto-Incrementing Consignments**: New shipments receive deterministic IDs (`CID-5001`, `ST5001`).
- **Simulated Fixtures**:
  - `1001` / `ST1001` → `in_review`
  - `1002` / `ST1002` → `pending`
  - `1003` / `ST1003` → `in_transit`
  - `1004` / `ST1004` → `out_for_delivery`
  - `1005` / `ST1005` → `delivered`
  - `1006` / `ST1006` → `partial_delivered`
  - `1007` / `ST1007` → `hold`
  - `1008` / `ST1008` → `cancelled`
- **Error Simulation Triggers**:
  - Invoices containing `FAIL` trigger simulated 400 Bad Request.
  - Invoices containing `TIMEOUT` trigger simulated 504 Gateway Timeout.
- **Simulated Remittance Balance**: Reports a configurable mock balance of `৳24,850.00`.

### Live Mode (`STEADFAST_MODE=live`)
- Connects directly to Steadfast Courier's REST API at `STEADFAST_BASE_URL`.
- Sends authentication headers:
  ```http
  Api-Key: <STEADFAST_API_KEY>
  Secret-Key: <STEADFAST_SECRET_KEY>
  Content-Type: application/json
  Accept: application/json
  ```
- Retries are strictly disabled on parcel creation to protect against duplicate consignments.
- Public tracking links point to `https://steadfast.com.bd/t/{tracking_code}`.

---

## 4. Create Shipment Workflow

When an atelier admin clicks **"Create Steadfast Shipment"** in the order dashboard:

1. **Authentication & Authorization**:
   - The user must be authenticated with role `SUPER_ADMIN`, `ADMIN`, or `MANAGER` and hold `orders` permission.
2. **Order State Validation**:
   - Verifies the order is not `CANCELLED` or `REFUNDED`.
   - Validates recipient phone number and delivery address completeness.
3. **Idempotency & Duplicate Prevention**:
   - Checks the database for any existing active `Shipment` associated with the order.
   - If an active consignment is already present, rejects with `409 ConflictException`.
4. **Authoritative COD Calculation**:
   - **Prepaid Orders** (`paymentStatus === 'PAID'`): `codAmount = 0`.
   - **Cash on Delivery**: `codAmount = totalAmount - paidAmount`.
   - *Never accepts an unvalidated client-supplied COD override.*
5. **Invoice Association**:
   - Guarantees the order has an immutable tax invoice (`RL-INV-YYYY-XXXXXX`) via `InvoicesService`.
   - Passes this official invoice number to Steadfast for accounting reconciliation.
6. **Dispatch to Provider**:
   - Calls `courierProvider.createShipment(...)`.
7. **Database Transaction**:
   - Creates a `Shipment` record with consignment ID, tracking code, provider status, and COD amount.
   - Appends a `ShipmentEvent` (`eventType: 'CREATED'`, `source: 'ADMIN'`).
   - Synchronizes order courier snapshot fields.
   - Automatically transitions order status from `CONFIRMED` / `PROCESSING` / `PACKED` to `SHIPPED`.
8. **Audit Logging**:
   - Records an immutable audit log entry in `admin_audit_logs`.

---

## 5. Status Synchronization & Centralized Mapping

Status values returned by Steadfast API endpoints or webhooks are mapped into the internal `ShipmentStatus` enum:

| Steadfast Raw Status | Internal `ShipmentStatus` | Patron Display Label | Order Automation |
|---|---|---|---|
| `in_review`, `review` | `IN_REVIEW` | Consignment Registered | None |
| `pending`, `pickup_pending` | `PENDING` | Consignment Registered | None |
| `in_transit`, `transit`, `sorting_hub` | `IN_TRANSIT` | In Transit | None |
| `out_for_delivery`, `with_rider` | `OUT_FOR_DELIVERY` | Out for Delivery | None |
| `delivered`, `completed`, `success` | `DELIVERED` | Delivered | Advances Order to `DELIVERED`; settles COD payment to `PAID` |
| `partial_delivered`, `partial` | `PARTIAL_DELIVERED` | Partially Delivered | None |
| `hold`, `on_hold`, `delayed` | `ON_HOLD` | Delivery Scheduled / On Hold | None |
| `cancelled`, `canceled` | `CANCELLED` | Cancelled | None |
| `return`, `returned` | `RETURNED` | Returned to Origin | None |
| Unmapped status string | `UNKNOWN` | Processing | **Gated: Zero automated side effects** |

---

## 6. Webhook Processing (`POST /webhooks/steadfast`)

Steadfast delivers asynchronous status updates via webhooks.

### Processing Steps:
1. **Secret & Signature Verification**:
   If `STEADFAST_WEBHOOK_SECRET` is set, verifies matching headers (`x-steadfast-signature`, `x-webhook-secret`).
2. **Identifier Extraction**:
   Accepts `consignment_id`, `invoice`, or `tracking_code`.
3. **Idempotency Gate**:
   If the latest event recorded for the shipment is already `WEBHOOK_RECEIVED` with the same status, returns HTTP 200 immediately without redundant database mutations.
4. **Transactional Mutation**:
   - Updates `Shipment.status` and `Shipment.providerStatus`.
   - Records `ShipmentEvent` with full payload snapshot.
   - Updates `Order` status to `DELIVERED` and marks payment `PAID` if the status is confirmed delivered.

---

## 7. Database Models

```prisma
enum ShipmentStatus {
  PENDING
  IN_REVIEW
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  PARTIAL_DELIVERED
  CANCELLED
  ON_HOLD
  RETURNED
  UNKNOWN
}

model Shipment {
  id               String         @id @default(uuid())
  orderId          String
  order            Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  provider         String         @default("STEADFAST")
  consignmentId    String?
  trackingCode     String?
  providerInvoice  String?
  status           ShipmentStatus @default(PENDING)
  providerStatus   String?
  codAmount        Decimal        @default(0.00) @db.Decimal(10, 2)
  deliveryCharge   Decimal        @default(0.00) @db.Decimal(10, 2)
  returnCharge     Decimal        @default(0.00) @db.Decimal(10, 2)
  trackingUrl      String?
  recipientName    String?
  recipientPhone   String?
  recipientAddress String?
  note             String?
  metadata         Json?
  lastSyncedAt     DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  events           ShipmentEvent[]

  @@unique([provider, consignmentId])
  @@unique([provider, trackingCode])
  @@index([orderId])
  @@index([provider, providerInvoice])
  @@index([status])
  @@map("shipments")
}

model ShipmentEvent {
  id         String   @id @default(uuid())
  shipmentId String
  shipment   Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  eventType  String
  status     String
  message    String?
  source     String   @default("SYSTEM")
  payload    Json?
  createdAt  DateTime @default(now())

  @@index([shipmentId, createdAt])
  @@map("shipment_events")
}
```

---

## 8. New API Endpoints

### Administrative Endpoints (Bearer JWT Required, Role: SUPER_ADMIN / ADMIN / MANAGER)
- `POST /admin/orders/:orderId/shipment`: Create and book a parcel shipment for an order.
- `GET /admin/orders/:orderId/shipment`: Fetch full shipment details and event history.
- `POST /admin/orders/:orderId/shipment/refresh-status`: Sync latest delivery status from Steadfast.
- `POST /admin/orders/:orderId/shipment/return`: Book a return request.
- `GET /admin/courier/health`: Check provider operational health and connectivity.
- `GET /admin/courier/balance`: Check merchant Steadfast account balance.
- `GET /admin/courier/status-by-cid/:consignmentId`: Live lookup by Consignment ID.
- `GET /admin/courier/status-by-invoice/:invoice`: Live lookup by invoice.
- `GET /admin/courier/status-by-tracking/:trackingCode`: Live lookup by tracking code.

### Public Webhook Endpoint
- `POST /webhooks/steadfast`: Ingest asynchronous delivery status webhook notifications.

---

## 9. Security & Production Checklist

- [x] **No Secret Leakage**: API Key and Secret Key are stored only in environment variables and never exposed to the browser or customer responses.
- [x] **Authoritative COD Calculation**: COD is computed on the backend from actual order totals minus verified payments.
- [x] **Duplicate Booking Protection**: Unique database indexes and transactional checks prevent duplicate consignment creation.
- [x] **Safe Status Gates**: Unknown statuses never trigger automated order completions, inventory releases, or financial settlements.
- [x] **Safe Structured Logging**: Sensitive headers and tokens are redacted before logging.
- [x] **Zero Reliance on Undocumented Sandbox URLs**: Explicit mock simulator ensures deterministic local testing without inventing undocumented sandbox domains.
