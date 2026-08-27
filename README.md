# VerifyIt — Nigeria's Verified Commerce & Fintech Platform

> Authenticate products. Protect customers. Unlock financial access.

VerifyIt is a full-stack product verification and fintech platform built for the Nigerian market. Businesses register products and generate QR codes for authentication. Consumers scan to verify authenticity. The platform doubles as a financial identity layer — enabling invoice discounting, escrow payments, and First Bank–powered working capital loans based on verified business activity.

The platform ships with a custom **IoT hardware scanner** built on the ESP32-CAM — a temperature-gun–shaped device that captures product QR codes and verifies them in real time over WiFi, displaying results on an OLED screen.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Hardware Setup](#hardware-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Hardware Components](#hardware-components)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### Product Verification
- Businesses register with CAC number, NAFDAC/NDLEA registration
- Every product gets a unique short code and two QR codes — one for individual unit packs, one for bulk cartons
- QR codes encode a short URL (`/v/4XK9MZ`) that works on any phone camera without an app
- First-scan detection — alerts consumers if a seal has already been broken
- Scan history recorded with timestamps

### Fintech Layer (Powered by First Bank)
- **Trust Score** — algorithmic creditworthiness based on verified products, scan volume, CAC/NAFDAC status, and transaction history
- **Invoice Discounting** — submit an invoice, receive 80% upfront via First Bank
- **Escrow Payments** — funds held securely until carton QR is scanned and delivery is verified
- **Loan Eligibility** — Trust Score maps directly to working capital loan limits (₦500K–₦5M)
- **Premium Analytics** — scan trends, regional breakdown, product performance (premium tier)

### IoT Hardware Scanner
- ESP32-CAM based device shaped like a temperature gun
- Pull trigger → camera captures image → backend decodes QR → OLED shows result
- Green LED + triple beep = authentic · Red LED + long beep = counterfeit
- Dual-core FreeRTOS — trigger scanning on Core 1, phone scan polling on Core 0
- When a consumer scans on their phone, the result mirrors to the OLED within 2 seconds

### Mobile-First Web App
- React frontend with in-browser QR scanner (no app required)
- Business dashboard: products, scans, trust score, escrow, invoices
- Public verification page for consumers
- Fully responsive — desktop dashboard + mobile-optimised layout with bottom tab navigation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERIFYIT SYSTEM                          │
│                                                                 │
│   ┌──────────────────┐        ┌─────────────────────────────┐   │
│   │  React Frontend  │◄──────►│   Node.js / Express API     │   │
│   │  (Vite + TW CSS) │  REST  │   (Render.com deployment)   │   │
│   └──────────────────┘        └──────────┬──────────────────┘   │
│                                          │                       │
│   ┌──────────────────┐        ┌──────────▼──────────────────┐   │
│   │  ESP32-CAM       │        │   MongoDB Atlas             │   │
│   │  Hardware Scanner│◄──────►│   Cloudinary (images)       │   │
│   │  (WiFi + HTTPS)  │  HTTPS │   Paystack (payments)       │   │
│   └──────────────────┘        └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Scan flows:**

```
Phone scan:
  Consumer scans QR → /v/4XK9MZ → backend resolves → verify page
  Backend saves to DisplayQueue → ESP32 polls → shows on OLED (< 2s)

Hardware scan:
  Trigger pressed → ESP32-CAM captures JPEG → POST /api/scan/decode
  Backend decodes QR (ZXing) → looks up product → JSON response
  ESP32 displays result on OLED + LED + buzzer feedback
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT + bcryptjs | Authentication |
| Cloudinary | Product image storage |
| Paystack | Payment processing |
| zxing-wasm | Server-side QR code decoding (from ESP32 images) |
| jimp | Image preprocessing before QR decode |
| multer | File upload handling |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS v3 | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| qr-scanner (Nimiq) | In-browser QR code scanning |
| react-hot-toast | Notifications |
| lucide-react | Icons |

### Hardware
| Component | Purpose |
|---|---|
| ESP32-CAM (AI-Thinker) | Microcontroller + camera |
| SSD1306 OLED (0.96") | Result display |
| FreeRTOS (built-in) | Dual-core task management |
| WiFiClientSecure | HTTPS communication |
| ArduinoJson | JSON parsing |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Paystack account
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/verifyit.git
cd verifyit/verifyit-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your credentials — see Environment Variables section

# Start development server
npm run dev
```

The API will be running at `http://localhost:5000`.

Test it:
```bash
curl http://localhost:5000/
# {"message":"✅ VerifyIt API is running"}
```

### Frontend Setup

```bash
cd verifyit/verifyit-frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`.

### Hardware Setup

#### Requirements
- Arduino IDE 2.x
- ESP32 board support by Espressif (install via Board Manager)
- Libraries: `Adafruit SSD1306`, `Adafruit GFX`, `ArduinoJson`

#### Upload Steps

1. Open `verifyit-hardware/VerifyIt.ino` in Arduino IDE
2. Update WiFi credentials and API URL at the top of the sketch
3. Select **Tools → Board → AI Thinker ESP32-CAM**
4. Select **Tools → PSRAM → Enabled**
5. Select **Tools → Partition Scheme → Huge APP (3MB No OTA)**
6. Connect ESP32-CAM-MB via USB
7. Click Upload
8. Open Serial Monitor at 115200 baud to confirm boot

#### Wiring

| ESP32-CAM Pin | Component |
|---|---|
| 3.3V | OLED VCC |
| GND | OLED GND, LED cathodes, Buzzer − |
| GPIO14 (SDA) | OLED SDA |
| GPIO15 (SCL) | OLED SCL |
| GPIO13 | Trigger button (leg 1) |
| GND | Trigger button (leg 2) |
| GPIO12 | Green LED anode → 220Ω resistor |
| GPIO2 | Red LED anode → 220Ω resistor |
| GPIO4 | Buzzer + (also onboard flash LED) |
| 5V | Power input (from USB or TP4056 OUT+) |

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/verifyit

# Authentication
JWT_SECRET=your-long-random-secret-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key_here
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a business |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get own profile |
| PUT | `/api/auth/profile` | Yes | Update profile |
| POST | `/api/auth/logout` | Yes | Logout, blacklists token |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/products` | Yes | Create product + generate QR codes |
| GET | `/api/products` | Yes | List all products |
| GET | `/api/products/:id` | Yes | Get single product |
| PUT | `/api/products/:id` | Yes | Update product |
| DELETE | `/api/products/:id` | Yes | Delete product |

### Verification
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/verify/:productId` | No | Verify by MongoDB ID |
| GET | `/api/verify/:productId/carton` | No | Verify carton by MongoDB ID |
| GET | `/api/verify/code/:shortCode` | No | Verify by short code (used by ESP32) |
| GET | `/v/:code` | No | Short URL redirect (used by phone scan) |

### Fintech
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/trust-score` | Yes | Get Trust Score and loan eligibility |
| POST | `/api/escrow` | Yes | Create escrow |
| GET | `/api/escrow` | Yes | List all escrows |
| PUT | `/api/escrow/:id/release` | Yes | Release escrow |
| PUT | `/api/escrow/:id/dispute` | Yes | Raise dispute |
| POST | `/api/invoices` | Yes | Submit invoice for discounting |
| GET | `/api/invoices` | Yes | List all invoices |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/initiate` | No | Initiate Paystack payment |
| POST | `/api/payments/verify` | No | Verify payment after redirect |

### Hardware (ESP32)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/scan/decode` | No | Receives JPEG image, decodes QR, returns product JSON |
| GET | `/api/display/latest` | No | Polling endpoint for phone scan mirroring |

### Analytics (Premium)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/scans` | Premium | Scan trend data (last 30 days) |

---

## Hardware Components

Full bill of materials for the ESP32-CAM scanner:

| Component | Quantity | Notes |
|---|---|---|
| ESP32-CAM (AI-Thinker) | 1 | Get the version with ESP32-CAM-MB programmer board |
| OLED Display 0.96" SSD1306 (I2C) | 1 | 128×64 pixels |
| Tactile push button | 1 | Trigger |
| Green LED (5mm) | 1 | Verified indicator |
| Red LED (5mm) | 1 | Counterfeit alert |
| Active buzzer | 1 | Audio feedback |
| 220Ω resistors | 2 | LED current limiting |
| PVC pipe 25mm | ~12cm | Barrel of the gun |
| Plastic project box | 1 | Body and handle |
| USB power supply or TP4056 + 18650 battery | 1 | Power |
| Veroboard / Stripboard | 1 | For final permanent build |
| Jumper wires | — | For prototyping |

The device is housed in a modified project box shaped to resemble a temperature gun. The ESP32-CAM module sits inside the barrel housing, pointing forward. The OLED display is mounted on the back face. LEDs are mounted beside the display. The trigger button is in the handle area.

---

## How It Works

### Trust Score Algorithm

The Trust Score is calculated on every profile update, product registration, and completed transaction:

```
CAC registration number provided    → +20 points (max 20)
NAFDAC registration number provided → +15 points (max 15)
Products registered (×2 each)       → up to +20 points
QR scan volume (1 per 10 scans)     → up to +25 points
Successful transactions (×1 each)   → up to +20 points

Total maximum: 100 points
```

Loan eligibility tiers:
```
Score 80–100 → Gold tier   → up to ₦5,000,000
Score 60–79  → Silver tier → up to ₦2,000,000
Score 40–59  → Bronze tier → up to ₦500,000
Score 0–39   → Not eligible
```

### QR Short Code System

Every product gets a unique 6-character short code (e.g. `4XK9MZ`) using a character set that excludes easily confused characters (`0`, `O`, `1`, `I`).

The QR code encodes `https://your-domain.com/v/4XK9MZ`:
- **Phone scan** → browser opens URL → backend redirects to `/verify/:mongoId` → verification page renders
- **ESP32 scan** → ESP32 extracts short code → calls `/api/verify/code/4XK9MZ` → gets JSON directly

### Phone-to-OLED Mirroring

When a consumer verifies a product on their phone, the result appears on the ESP32 OLED screen within 2 seconds:

1. Phone scan triggers `/api/verify/code/:shortCode`
2. Backend records verification result in `DisplayQueue` collection (auto-expires after 10 seconds via MongoDB TTL index)
3. ESP32 Core 0 polls `/api/display/latest?after=TIMESTAMP` every 2 seconds
4. New result detected → `interruptDisplay` flag set → current screen exits early → new result shown

---

## Project Structure

```
verifyit/
├── verifyit-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js          # Cloudinary + multer setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── verify.controller.js
│   │   │   ├── scan.controller.js     # ESP32 image decode endpoint
│   │   │   ├── display.controller.js  # Phone-to-OLED polling
│   │   │   ├── escrow.controller.js
│   │   │   ├── invoice.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── trustScore.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── premium.middleware.js
│   │   │   └── uploadError.middleware.js
│   │   ├── models/
│   │   │   ├── Business.model.js
│   │   │   ├── Product.model.js
│   │   │   ├── Scan.model.js
│   │   │   ├── Transaction.model.js
│   │   │   ├── Escrow.model.js
│   │   │   ├── Invoice.model.js
│   │   │   ├── Dispute.model.js
│   │   │   ├── BlacklistedToken.model.js
│   │   │   └── DisplayQueue.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── verify.routes.js
│   │   │   ├── scan.routes.js
│   │   │   ├── display.routes.js
│   │   │   ├── short.routes.js
│   │   │   ├── escrow.routes.js
│   │   │   ├── invoice.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── trustScore.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── services/
│   │   │   └── trustScore.service.js
│   │   ├── utils/
│   │   │   └── shortCode.js
│   │   └── app.js
│   └── server.js
│
├── verifyit-frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # Desktop sidebar + mobile drawer + bottom tabs
│   │   │   ├── UI.jsx                 # Layout, StatCard, Modal, EmptyState etc.
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── QRScanner.jsx          # In-browser camera scanner
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useQRScan.js
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx           # 3-step registration flow
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── AddProduct.jsx
│   │       ├── ProductDetail.jsx      # QR code download
│   │       ├── Verify.jsx             # Public verification page
│   │       └── OtherPages.jsx         # Escrow, Invoices, TrustScore, Analytics, Profile
│   └── App.jsx
│
└── verifyit-hardware/
    └── VerifyIt.ino                   # Complete ESP32-CAM Arduino sketch
```

---

## Roadmap

- [ ] 2FA via SMS (Termii API)
- [ ] First Bank API direct integration for loan disbursement
- [ ] Live CAC and NAFDAC API verification
- [ ] Premium subscription billing via Paystack
- [ ] Per-unit QR serialization for large manufacturers
- [ ] React Native mobile app for easier scanning
- [ ] Scan location heatmap (premium analytics)
- [ ] Admin dashboard for dispute resolution
- [ ] AUTOSAR/ISO 26262 compliance documentation for pharmaceutical clients

---

## Academic Context

This project was developed as a final year project for the Department of Electrical and Electronics Engineering, University of Abuja. It satisfies both software engineering and embedded systems components of the programme:

- **Software:** Full-stack web application (Node.js + React)
- **Embedded Systems:** IoT verification terminal (ESP32-CAM + FreeRTOS)
- **Fintech:** First Bank innovation pitch competition submission

The system demonstrates practical application of:
- IoT hardware-software integration
- REST API design and implementation
- Real-time dual-core embedded programming (FreeRTOS)
- HTTPS communication from microcontrollers
- MongoDB TTL indexes for automatic data expiry
- Mutex-based concurrency control on embedded systems

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built by Teejey · University of Abuja · EEE Department</strong><br/>
  <em>Powered by First Bank Nigeria · CAC & NAFDAC Verified</em>
</div>
