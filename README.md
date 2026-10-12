# PlumbMart — Multi-Role Plumbing Commerce & Zoho Synchronisation Platform

Built for the **Waytowebs Mobile App Development – Interview Task**.

## 1. User Roles & Dashboards
1. **Customer Dashboard** (B2C Retail)
2. **Dealer Dashboard** (B2B Wholesale + Zoho CRM Verification + 30/90-Day Credit Checkout)
3. **Plumber Dashboard** (Field Partner App: Assigned Installations, Technical Product Guide, Reward Points & Notifications)
4. **Admin Control Portal** (Full governance over Customers, Dealers, Plumbers, Zoho Workbook Products, Orders, Payments, 30/90-Day Credit Eligibility & Reports)

---

## 2. Core Business Logic Implemented

### A. Login & Registration (OTP Only)
- **Passwordless OTP Authentication** (`POST /api/auth/send-otp` & `POST /api/auth/verify-otp`).
- **Customer**: Any 10-digit mobile number can register/login using OTP (`123456`).
- **Dealer**: Can login **ONLY if their mobile number is registered and verified in Zoho** (`zohoVerified: true`). Unverified dealers (e.g. `9000033333`) are blocked at login until verified by Admin.
- **Plumber**: Follows trade license & KYC verification status (`VERIFIED` vs `PENDING_VERIFICATION`).

### B. Products, Pricing & Stock (Zoho Workbook Synchronisation)
- Master inventory is maintained and synchronised from **Zoho Workbook** (`GET /api/products`, `POST /api/zoho/sync`, `PUT /api/zoho/workbook/:productId`).
- **Customers**: View retail prices (`customerPrice`) and general availability (`inStock`), **but CANNOT see stock quantity** (stripped at the API level).
- **Dealers**: View wholesale dealer pricing (`dealerPrice`) and **exact available stock quantity** (`stockQuantity`) plus Minimum Order Quantity (`minDealerOrderQty`).

### C. Dealer Payment & Credit Governance
- **Upfront Payment**: Available to all verified dealers.
- **Credit Payment – 30 Days**: Available to credit-eligible dealers (`credit30DaysAllowed: true`).
- **Credit Payment – 90 Days**: Restricted **ONLY to selected/approved dealers** (`credit90DaysAllowed: true`).

---

## 3. Quick Demo Accounts (OTP: `123456`)

| Role | Name | Mobile | Key Behaviour |
| :--- | :--- | :--- | :--- |
| **Customer** | Rahul Sharma | `9876543210` | Retail price only, **stock quantity hidden**, Direct Payment & live order tracking |
| **Dealer (90D Approved)** | Sri Venkateswara Distributors | `9000011111` | Zoho Verified, sees **exact stock quantity**, Upfront + 30-Day + **90-Day Credit unlocked** |
| **Dealer (30D Only)** | Metro Pipe Syndicate | `9000022222` | Zoho Verified, sees **exact stock quantity**, Upfront + 30-Day Credit (**90-Day locked**) |
| **Dealer (Unverified)** | Coastal Builders Mart | `9000033333` | **Blocked at OTP login** until Admin enables Zoho Verification |
| **Plumber** | Ramesh Babu | `9111122222` | Assigned customer installations, technical specs, reward points & notifications |

---

## 4. Running the Project

### Backend (`http://localhost:5000`)
```bash
cd backend
npm install
npm start
```

### Frontend (`http://localhost:3000`)
```bash
cd frontend
npm install
npm run dev
```
