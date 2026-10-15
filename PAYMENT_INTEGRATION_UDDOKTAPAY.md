# UddoktaPay Hosted Payment Gateway Integration

**Project:** Rongin Libas E-commerce (`https://runginlibas.com`)  
**Gateway Provider:** UddoktaPay (`https://uddoktapay.com`)  
**API Specification:** UddoktaPay Checkout v2 (`/api/checkout-v2`, `/api/verify-payment`, Instant Payment Notification)  
**Integration Status:** Complete, Tested, Co-existing with Waitmark Pay  

---

## 1. Overview & Architecture

The UddoktaPay Hosted Payment Gateway integration provides a secure, production-grade checkout and settlement flow for Rongin Libas customers across bKash, Nagad, Rocket, Upay, Cards, and other Bangladeshi payment channels without compromising existing integrations (such as Waitmark Pay or Cash on Delivery).

```
+--------------------------------------------------------------------------------------------------+
|                                  UDDOKTAPAY INTEGRATION FLOW                                     |
+--------------------------------------------------------------------------------------------------+

 [Customer Storefront]              [NestJS Backend API]                   [UddoktaPay Gateway]
          |                                   |                                       |
          |  1. Place Order (UDDOKTAPAY)      |                                       |
          |---------------------------------->| (Order created as PENDING_PAYMENT)    |
          |                                   |                                       |
          |  2. Initiate Payment (orderId)    |                                       |
          |---------------------------------->| Validates order ownership & state     |
          |                                   | Authoritatively computes payable sum  |
          |                                   | Generates internal payment attempt    |
          |                                   | POST {BASE_URL}/api/checkout-v2       |
          |                                   | Headers: RT-UDDOKTAPAY-API-KEY        |
          |                                   |-------------------------------------->|
          |                                   |                                       |
          |                                   | Receives payment_url & invoice_id     |
          |  3. { paymentUrl, invoiceId }     |<--------------------------------------|
          |<----------------------------------| Stores providerInvoiceId in Payment   |
          |                                                                           |
          |  4. Redirect browser to UddoktaPay Hosted Checkout                        |
          |==========================================================================>|
          |                                                                           | Customer pays via
          |                                                                           | bKash/Nagad/Rocket
          |                                                                           |
          |                                   |  5. Webhook POST (IPN)                |
          |                                   |     Header: RT-UDDOKTAPAY-API-KEY     |
          |                                   |<======================================|
          |                                   | Validates API Key header              |
          |                                   | Matches invoice_id, amount & currency |
          |                                   | Idempotent atomic state update (PAID) |
          |                                   | Dispatches email/SMS & GA4 events     |
          |                                   |                                       |
          |  6. Redirect back to Result Page  |                                       |
          |     /payment/result?invoice_id=.. |                                       |
          |---------------------------------->|                                       |
          |                                   |                                       |
          |  7. Authoritative Verify / Status |                                       |
          |     POST /api/v1/payments/        |                                       |
          |          uddoktapay/verify        |                                       |
          |---------------------------------->| Server-to-server POST /verify-payment |
          |                                   |-------------------------------------->|
          |                                   | Receives authoritative payload        |
          |                                   |<--------------------------------------|
          |                                   | Finalizes state if webhook delayed    |
          |  8. Verified Order Status         |                                       |
          |<----------------------------------| Never trusts redirect query params    |
          v                                   v                                       v
```

---

## 2. Environment Variables Configuration

The following environment variables are required and configured:

### Backend (`server/.env` and `server/.env.example`)
```env
# UddoktaPay / Paymently Hosted Gateway Configuration
UDDOKTAPAY_BASE_URL=https://ronginlibas.paymently.io/api
UDDOKTAPAY_API_KEY=your_uddoktapay_api_key_here

# Public Reachable URLs for Redirects & Webhooks
FRONTEND_URL=https://runginlibas.com
BACKEND_PUBLIC_URL=https://api.runginlibas.com
```

> **Note for Gateway Endpoint Normalization:**
> - Merchant Endpoint: `https://ronginlibas.paymently.io/api` (automatically resolves checkout session to `/api/checkout-v2` and verification to `/api/verify-payment` without double `/api` path issues).
> - Sandbox Base URL: `https://sandbox.uddoktapay.com`

---

## 3. Database Changes & Prisma Migration

1. **Enum Extension:**
   Added `UDDOKTAPAY` to the `PaymentMethod` enum in `prisma/schema.prisma`.
2. **Payment Model Extension:**
   Added `providerInvoiceId String?` to `model Payment` along with an index `@@index([providerInvoiceId])` for fast O(1) lookups during webhooks and verification callbacks.
3. **Migration SQL:**
   `server/prisma/migrations/20261015200000_add_uddoktapay_payment_method/migration.sql`
   ```sql
   ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'UDDOKTAPAY';
   ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "providerInvoiceId" TEXT;
   CREATE INDEX IF NOT EXISTS "payments_providerInvoiceId_idx" ON "payments"("providerInvoiceId");
   ```
4. **Prisma Client:**
   Regenerated with `npx prisma generate`.

---

## 4. NestJS Backend Routes & Endpoints

All endpoints are hosted under `/api/v1/payments/uddoktapay/*`:

| HTTP Method | Route Path | Access / Guard | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/uddoktapay/initiate` | `OptionalJwtAuthGuard` | Initiates hosted checkout session with UddoktaPay for an eligible unpaid order. Returns `{ paymentUrl, invoiceId, attemptId }`. |
| `POST` | `/api/v1/payments/uddoktapay/verify` | `OptionalJwtAuthGuard` | Performs server-to-server verification via `/api/verify-payment` against UddoktaPay using `invoice_id`. |
| `POST` | `/api/v1/payments/uddoktapay/webhook` | Public (Header Auth) | Receives UddoktaPay IPN webhook. Validates `RT-UDDOKTAPAY-API-KEY`, amount tolerance, duplicate transactions, and atomically marks order as `PAID`. |
| `GET` | `/api/v1/payments/uddoktapay/redirect` | Public | Handles browser success redirect from UddoktaPay. Redirects customer to `${FRONTEND_URL}/payment/result?invoice_id=...&orderId=...`. |
| `GET` / `POST` | `/api/v1/payments/uddoktapay/cancel` | Public | Handles cancellation redirect from UddoktaPay. Redirects customer to `${FRONTEND_URL}/payment/result?status=cancelled&invoice_id=...`. |

---

## 5. Security & Reliability Highlights

- **Server-Authoritative Payable Sum:** Payable amounts are calculated strictly from the database order record (`order.totalAmount`), never trusted from client payloads.
- **Order Ownership & State Guard:** Only the order owner (matching customer ID or authenticated guest session) can initiate payment, and only for orders in `PENDING_PAYMENT` status.
- **Timing-Safe Constant-Time Webhook Check:** Webhook API key verification uses `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- **Amount & Currency Validation:** Webhooks verify that `Number(payload.amount)` matches `order.totalAmount` within a strict 0.01 tolerance.
- **Duplicate Prevention & Idempotency:** Duplicate transaction IDs (`payload.transaction_id`) and duplicate callbacks are checked atomically; settled payments safely return idempotent success without duplicate inventory deduction or multi-crediting.
- **Secret Isolation:** `UDDOKTAPAY_API_KEY` is never exposed to the frontend or sent to browser clients.

---

## 6. Frontend Storefront (`web/`) Integration

- **Checkout Page (`/checkout`):**
  - Added UddoktaPay selection option with bKash, Nagad, Rocket, Upay, and Card badges.
  - Generates order with `paymentMethod: 'UDDOKTAPAY'`.
  - Automatically calls backend `/api/v1/payments/uddoktapay/initiate` and redirects customer to `paymentUrl`.
  - Preserves cart on cancellation or failure; cart is cleared only upon authoritative payment confirmation.
- **Payment Result Page (`/payment/result`):**
  - Accepts `invoice_id` parameter from redirect.
  - Automatically triggers backend verification via `/api/v1/payments/uddoktapay/verify`.
  - Displays dynamic retry button linking to UddoktaPay checkout for unpaid orders.
- **Customer Order History (`/orders`):**
  - Displays UddoktaPay payment badge.
  - "Pay Now" action dynamically launches UddoktaPay checkout initiation for unpaid orders.

---

## 7. Admin Dashboard (`admin/`) Integration

- **Orders List (`/orders`):**
  - Added `UDDOKTAPAY` filter option to payment method dropdown.
  - Styled with a teal badge distinguishing UddoktaPay from Waitmark Pay and Cash on Delivery.
  - Payment details modal displays UddoktaPay Invoice ID (`providerInvoiceId`), transaction reference, channel, and exact timestamp.
- **Order Creation (`/orders/create`):**
  - Supports selecting UddoktaPay as a payment method for manual draft orders.

---

## 8. Provider Dashboard Configuration

To complete go-live on the UddoktaPay Merchant Dashboard (`https://merchant.uddoktapay.com` or Sandbox):

1. **API Credentials:** Copy your Merchant API Key into `server/.env` under `UDDOKTAPAY_API_KEY`.
2. **Webhook / IPN URL:**
   Configure your Webhook URL to point to:
   `https://<your-backend-domain>/api/v1/payments/uddoktapay/webhook`
3. **Whitelist IPs (if applicable):**
   Ensure firewall allows inbound POST requests from UddoktaPay IP ranges to `/api/v1/payments/uddoktapay/webhook`.
