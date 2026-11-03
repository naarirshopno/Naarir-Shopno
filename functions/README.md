# Naarir Shopno - Firebase Cloud Functions

This directory contains the automated Firebase Cloud Function (`onOrderCreatedSendEmail`) that listens to Firestore order documents and triggers an automated, branded HTML confirmation email upon successful order placement.

---

## ⚡ Trigger Overview

- **Trigger Event:** Firestore `onDocumentCreated`
- **Path:** `/orders/{orderId}`
- **Region:** `asia-southeast1` (matches project region)
- **Recipient:** Customer's email (`order.customerEmail`), with CC to Store Admin (`ADMIN_NOTIFICATION_EMAIL`).

---

## 🚀 Setup & Local Testing

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your email SMTP credentials (e.g. Gmail App Password, Resend, or SendGrid):
```ini
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-google-app-password"
FROM_NAME="নারীর স্বপ্ন (Naarir Shopno)"
FROM_EMAIL="support@naarirshopno.com"
ADMIN_NOTIFICATION_EMAIL="AliIslam01911@gmail.com"
```

### 3. Run Locally with Firebase Emulator
```bash
npm run serve
```

---

## 📦 Deployment to Firebase

To deploy this function to your live Firebase project:
```bash
# Login to Firebase (if not already logged in)
firebase login

# Deploy only the Cloud Functions
firebase deploy --only functions
```

---

## 🛡️ Trigger Email Extension Compatibility

In addition to direct SMTP dispatch, this function also automatically creates documents in the `/mail` collection. If you have the official Firebase **Trigger Email from Firestore** extension (`firestore-send-email`) installed on your Firebase project, it will also process and dispatch emails automatically.
