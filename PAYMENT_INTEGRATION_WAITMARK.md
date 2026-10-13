# Waitmark Pay Payment Gateway Integration

**Project:** Rongin Libas E-commerce (`https://runginlibas.com`)  
**Gateway Provider:** Waitmark Pay (`https://pay.waitmark.com/`)  
**Official Developer Documentation:** `https://pay.waitmark.com/developers`  
**Integration Status:** Complete, Tested, Production-Ready  

---

## 1. Overview & Architecture

The Waitmark Pay integration provides a secure, production-grade checkout and settlement flow for Rongin Libas customers across cards, mobile financial services (bKash, Nagad, Rocket), and digital wallets.

```
+--------------------------------------------------------------------------------------------------+
|                                    WAITMARK PAY INTEGRATION FLOW                                 |
+--------------------------------------------------------------------------------------------------+

 [Customer Storefront]              [NestJS Backend API]                    [Waitmark Pay Gateway]
          |                                   |                                        |
          |  1. Place Order (WAITMARK_PAY)    |                                        |
          |---------------------------------->| (Order created as PENDING_PAYMENT)     |
          |                                   |                                        |
          |  2. Initiate Payment (orderId)    |                                        |
          |---------------------------------->| Validates order ownership & state      |
          |                                   | Authoritatively computes payable amount|
          |                                   | Generates internal payment attempt ID  |
          |                                   | Builds official checkout URL           |
          |  3. { checkoutUrl, attemptId }    |                                        |
          |<----------------------------------|                                        |
          |                                                                            |
          |  4. Redirect browser to Waitmark Checkout                                  |
          |===========================================================================>|
          |                                                                            | Customer completes
          |                                                                            | payment (Cards/MFS)
          |                                                                            |
          |                                   |  5. Webhook POST (success_url)         |
          |                                   |     Header: X-Waitmark-Signature       |
          |                                   |<=======================================|
          |                                   | Raw request byte HMAC-SHA256 check     |
          |                                   | Validates order, amount, and currency  |
          |                                   | Idempotent atomic state update (PAID)  |
          |                                   |                                        |
          |  6. Redirect to Result Page       |                                        |
          |     /payment/result?orderId=...   |                                        |
          |---------------------------------->|                                        |
          |                                   |                                        |
          |  7. Poll Payment Status           |                                        |
          |     GET /api/v1/payments/status   |                                        |
          |<----------------------------------| Returns verified DB state              |
          |                                   | (Never trusts redirect query params)   |
          v                                   v                                        v
```

---

## 2. Environment Variables Configuration

### Server (`server/.env`)
Add the following variables to `server/.env` (and see `server/.env.example`):

```bash
# Waitmark Pay Gateway Configuration
WAITMARK_PUBLIC_KEY=wm_pub_xxxxxxxxxxxxxxxxxxxx
WAITMARK_SECRET_KEY=wm_sec_xxxxxxxxxxxxxxxxxxxx
WAITMARK_CHECKOUT_URL=https://pay.waitmark.com/checkout
WAITMARK_SUCCESS_URL=https://api.runginlibas.com/api/v1/payments/waitmark/webhook
```

| Variable | Description | Security Tier |
|---|---|---|
| `WAITMARK_PUBLIC_KEY` | Merchant Public API Key from Waitmark Pay dashboard. | Public |
| `WAITMARK_SECRET_KEY` | Merchant Secret API Key for HMAC-SHA256 verification. | **Strictly Private (Backend only)** |
| `WAITMARK_CHECKOUT_URL` | Gateway hosted checkout URL (`https://pay.waitmark.com/checkout`). | Public |
| `WAITMARK_SUCCESS_URL` | Public HTTPS webhook & callback URL to receive the gateway IPN payload. | Backend Config |

> **Important Security Rule:**
> `WAITMARK_SECRET_KEY` is **NEVER** exposed to client components, Next.js browser builds, or response bodies.

---

## 3. Database Schema (Prisma & PostgreSQL)

The schema includes the `WAITMARK_PAY` enum value in `PaymentMethod` and introduces an auditable `Payment` model linked to `Order`.

### `server/prisma/schema.prisma`
```prisma
enum PaymentMethod {
  COD
  BKASH
  NAGAD
  CARD
  WAITMARK_PAY
}

model Payment {
  id                    String        @id @default(uuid())
  orderId               String
  order                 Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  provider              String        @default("WAITMARK_PAY") // Gateway provider
  providerOrderId       String        @unique // Internal unique payment attempt ID (e.g. WMPAY-RL...)
  providerTransactionId String?       // Gateway transaction ID (trx_id)
  amount                Decimal       @db.Decimal(12, 2)
  currency              String        @default("BDT")
  status                PaymentStatus @default(PENDING)
  failureReason         String?
  rawWebhookPayload     Json?
  paidAt                DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@index([orderId])
  @@index([providerOrderId])
  @@index([providerTransactionId])
  @@index([status])
}
```

---

## 4. Backend Endpoints & Architecture (`server/src/payments/`)

### A. List Active Payment Methods
- **Route:** `GET /api/v1/payments/methods`
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "COD",
        "name": "Cash on Delivery",
        "description": "Pay with cash upon delivery to your doorstep",
        "enabled": true
      },
      {
        "id": "WAITMARK_PAY",
        "name": "Waitmark Pay",
        "description": "Instant payment via Debit/Credit Card, bKash, Nagad, and Wallets",
        "enabled": true
      }
    ]
  }
  ```

### B. Initiate Payment
- **Route:** `POST /api/v1/payments/waitmark/initiate`
- **Access:** Customer / Guest Phone Ownership / Admin
- **Request Body:**
  ```json
  {
    "orderId": "34ee8a58-5a2d-4560-b8d2-5a21071d0b74",
    "customerPhone": "01711000000" // Required for guest checkouts
  }
  ```
- **Backend Safeguards:**
  1. Validates that the order exists and customer owns it.
  2. Ensures order is not `CANCELLED`, `REFUNDED`, or already `PAID`.
  3. Server recalculates authoritative payable amount (`total - discount + deliveryCharge`). Client-supplied amounts are ignored.
  4. Generates an internal payment attempt tracking ID: `WMPAY-RL<ORDER_NO>-<TIMESTAMP>`.
  5. Inserts an auditable `Payment` attempt record with status `PENDING`.
  6. Constructs the official checkout URL:
     `https://pay.waitmark.com/checkout?public_key=...&amount=...&order_id=...&success_url=...`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "paymentAttemptId": "WMPAY-RL1001-1772000000000",
      "checkoutUrl": "https://pay.waitmark.com/checkout?public_key=...&amount=2450.00&order_id=WMPAY-RL1001-1772000000000&success_url=...",
      "orderId": "34ee8a58-5a2d-4560-b8d2-5a21071d0b74",
      "amount": 2450
    }
  }
  ```

### C. Webhook / IPN Processing (Raw Body HMAC-SHA256)
- **Route:** `POST /api/v1/payments/waitmark/webhook`
- **Header:** `X-Waitmark-Signature: <hmac_sha256_hex>`
- **Raw Request Preservation:**
  Configured in NestJS `main.ts` with `{ rawBody: true }`. Signature is calculated directly on `(req as any).rawBody` using `crypto.createHmac('sha256', secretKey)` and compared using `crypto.timingSafeEqual`.
- **Payload Structure:**
  ```json
  {
    "status": "completed",
    "order_id": "WMPAY-RL1001-1772000000000",
    "amount": "2450.00",
    "trx_id": "WM_TRX_99283746",
    "currency": "BDT"
  }
  ```
- **Atomicity & Idempotency Safeguards:**
  1. **Idempotency Guard:** If the payment record is already `PAID`, returns `200 OK` with `{ status: 'already_processed' }` without firing duplicate side effects.
  2. **Amount Integrity:** Verifies that webhook amount matches authoritative database record within 0.01 BDT.
  3. **Atomic Transaction (`prisma.$transaction`):**
     - Marks `Payment` status `PAID`, sets `paidAt`, records `trx_id`.
     - Updates `Order` status: `paymentStatus = 'PAID'`, `status = 'CONFIRMED'`, `paymentReference = trx_id`, `paidAmount = amount`.
     - Inserts an `OrderTracking` timeline event for auditing.
  4. **Cancelled Order Reconciliation:** If webhook arrives for an order previously marked `CANCELLED`, records payment as `FLAGGED_CANCELLED_ORDER` and adds an admin notice rather than discarding evidence of real money.
  5. **Duplicate TrxID Protection:** Programmatically checks that incoming `providerTransactionId` has not already been credited to any other `Payment` record or `Order.paymentReference`. Rejects duplicate attempts across orders.
  6. **Currency Validation:** Enforces strict match against expected BDT currency (`payment.currency`).
  7. **Failure and Uncertain State Handling:** Webhooks reporting explicit failure statuses (`failed`, `cancelled`, `declined`, `rejected`, `expired`) set `payment.status = FAILED` and `order.paymentStatus = FAILED`. Inconclusive or processing statuses (`processing`, `pending`) remain `PENDING` awaiting final resolution.

### D. Payment Status Verification
- **Route:** `GET /api/v1/payments/status/:orderId`
- **Access:** Public or Authenticated (read-only safe attributes; also supports lookup by gateway `providerOrderId`)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "34ee8a58-5a2d-4560-b8d2-5a21071d0b74",
      "orderNumber": "RL-1001",
      "orderStatus": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "WAITMARK_PAY",
      "isPaid": true,
      "amount": 2450,
      "paidAmount": 2450,
      "paymentReference": "WM_TRX_99283746",
      "payments": [
        {
          "id": "...",
          "providerOrderId": "WMPAY-RL1001-1772000000000",
          "providerTransactionId": "WM_TRX_99283746",
          "status": "PAID",
          "amount": 2450,
          "paidAt": "2026-10-12T14:15:00.000Z"
        }
      ]
    }
  }
  ```

### E. Cart Policy & Inventory Reservation Architecture

1. **Cart Clearing & Snapshot:**
   - Orders store a complete, authoritative backend snapshot of all items, variant prices, delivery fees, customer details, and total payable amount.
   - The active cart is cleared upon order placement after saving recovery metadata (`rl_last_order_id`, `rl_last_order_uuid`, `rl_last_phone`, `rl_last_tracking_token`) to `sessionStorage`.
   - On payment failure, customer can click **"Restore Items to Cart"** (or **"Restore to Bag"** from order history).
   - The endpoint `POST /api/v1/cart/restore-order` cancels the unpaid order, releases its reserved stock, and re-adds eligible items to the active cart without duplicating any items already present in the bag.
   - Purchased items from already `PAID` orders are strictly prohibited from restoration.

2. **Inventory Stock Reservation & Timeout Release:**
   - Stock is reserved when the order is placed (`inventory - quantity` on `ProductVariant`).
   - If payment does not complete, stock is safely released upon customer cancellation, cart restoration, or through `cancelExpiredUnpaidOrders(timeoutMinutes = 30)`.
   - Retrying payment on an existing unpaid order reuses the reserved inventory and never deducts stock twice.

---

## 5. Frontend Storefront (`web/`)

1. **Checkout Selection (`web/src/app/checkout/page.tsx`):**
   - Displays clean payment selector:
     - **Cash on Delivery (COD)**
     - **Waitmark Pay (Cards, Mobile Banking & Wallets)**
   - When Waitmark Pay is chosen, placing the order initiates the payment with the backend and redirects the customer to the secure Waitmark gateway.
   - Caches order recovery tokens in `sessionStorage` before redirecting.
   - Disables submit buttons during pending requests to prevent double submission.
2. **Payment Result & Polling Page (`web/src/app/payment/result/page.tsx`):**
   - Route: `/payment/result?orderId=<ORDER_ID>`
   - Polls `GET /api/v1/payments/status/:orderId` at controlled intervals (up to 30 seconds).
   - Never trusts query strings alone—displays success badge only when the backend database confirms `paymentStatus === 'PAID'`.
   - Offers safe **"Retry Payment with Waitmark Pay"** button if gateway session expired or was declined (resets payment attempt without creating duplicate orders).
   - Offers **"Restore Items to Cart"** button to safely recover cart items and redirect back to `/cart`.
3. **Customer Orders View (`web/src/app/orders/OrdersClient.tsx`):**
   - Shows both **Order Status** and **Payment Status** badges distinctly.
   - Unpaid Waitmark Pay orders display quick action buttons: **"Pay Now"** (retry checkout) and **"Restore to Bag"** (restores order items to bag and cancels unpaid order).

---

## 6. Admin Panel (`admin/`)

1. **Orders Dashboard (`admin/src/app/orders/page.tsx`):**
   - Filter dropdown includes **Waitmark Pay**.
   - Distinctive purple badge displayed in orders table (`WAITMARK PAY`).
   - Order Dossier modal displays verified `Txn / Ref`, `Paid Amount`, and payment lifecycle status.
2. **Manual Order Creation (`admin/src/app/orders/create/page.tsx`):**
   - Includes `Waitmark Pay (Online Gateway)` in the Payment Channel dropdown.

---

## 7. Testing & Verification

### Automated Unit Test Suite
The backend unit test suites cover all checkout, payment, inventory, and cart recovery scenarios:
1. Valid order payment initiation and checkout URL generation.
2. Customer ownership verification & guest phone validation.
3. Denial of payment for orders belonging to another user.
4. Denial of payment for already-paid orders.
5. Denial of payment for cancelled orders.
6. Rejection of requests with missing configuration keys.
7. Webhook rejection when `X-Waitmark-Signature` is missing.
8. Webhook rejection when HMAC-SHA256 signature is invalid.
9. Webhook acceptance and state update for valid HMAC signatures.
10. Idempotent processing of duplicate webhook requests (no repeated updates).
11. Rejection of webhooks with mismatched amounts.
12. Rejection of webhooks with duplicate `providerTransactionId` across other payments.
13. Rejection of webhooks with duplicate `providerTransactionId` matching an existing order reference.
14. Rejection of webhooks with mismatched currency (`USD` vs `BDT`).
15. Non-completed gateway status handling (`failed`, `cancelled`, `declined` -> `paymentStatus = FAILED`).
16. Uncertain / processing status handling (leaves status in `PENDING` reconciliation).
17. Retry payment support: resetting `paymentStatus` to `PENDING` without duplicate order or double stock deduction.
18. Safe reconciliation handling for payments received on cancelled orders.
19. Status retrieval by `orderId`, `orderNumber`, or gateway `providerOrderId`.
20. Inventory reservation and release on cancellation (`cancelExpiredUnpaidOrders`).
21. Protection against cancelling or restoring items from already-paid orders.
22. Cart restoration (`POST /cart/restore-order`) preventing duplicate variant quantities in bag.

Run tests:
```bash
cd server
npx vitest run
```
**Result:** 134 / 134 tests passing across the backend suite (100%).

---

## 8. Deployment & Merchant Dashboard Steps

1. Log in to Waitmark Pay Merchant Dashboard: `https://pay.waitmark.com/`.
2. Navigate to **Developer Settings** / **API Keys**.
3. Copy **Public Key** and **Secret Key**.
4. Set backend environment variables on production server:
   ```bash
   WAITMARK_PUBLIC_KEY="<YOUR_PUBLIC_KEY>"
   WAITMARK_SECRET_KEY="<YOUR_SECRET_KEY>"
   WAITMARK_CHECKOUT_URL="https://pay.waitmark.com/checkout"
   WAITMARK_SUCCESS_URL="https://api.runginlibas.com/api/v1/payments/waitmark/webhook"
   ```
5. Ensure your domain has an active SSL certificate (HTTPS required for live webhooks).
6. Perform an initial test transaction in Waitmark Pay sandbox/live mode to verify end-to-end receipt.
