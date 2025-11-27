# BTTAL App

A modular React application for internal business invoicing, built with Firebase Authentication, Firestore database, and TailwindCSS. Designed for maintainability, clean structure, and scalability.

---

## About

BTTAL App is a fully functional invoicing and business management dashboard. It supports:

* Customer and product management
* Invoice creation & tracking
* Bank account and payment records
* Salesperson & commission reporting
* User management and settings
* Firebase authentication & Firestore persistence

The codebase is organized using a modern **feature-based folder structure**.

---

## Key Features

* Customer & product management
* Generate and manage invoices
* Track bank accounts and payments
* Salespersons & commission tracking
* User roles & management
* Firebase Auth + Firestore
* TailwindCSS UI
* Jest unit tests

---

## Tech Stack

* **React** (Create React App)
* **Firebase** (Auth, Firestore)
* **TailwindCSS**
* **Jest** for testing
* **ESLint + Prettier**

---

## Project Structure

```
src/
  components/
    bank/
    customers/
    invoices/
    products/
    salespersons/
    reports/
    settings/
    users/
    layout/
    common/
  services/
    firebase.js
  utils/
    invoice.js
    id.js
  App.js
```

---

## ScreenShots:
### Login Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 35 51 PM" src="https://github.com/user-attachments/assets/b7dfcc8e-2d52-4425-b211-39786eeea21c" />

### Dashboard

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 01 PM" src="https://github.com/user-attachments/assets/9288cef8-338a-4564-81de-54d31b13749c" />

### Dashboard (Dark Mode)

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 08 PM" src="https://github.com/user-attachments/assets/385b8b17-a477-424b-9161-7ca2f0c55891" />

### Customers Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 20 PM" src="https://github.com/user-attachments/assets/d774e847-4671-423f-b447-30ed21d6bfcf" />

### Products Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 28 PM" src="https://github.com/user-attachments/assets/323860ea-fe0f-481e-b016-e90437de7c37" />

### Create Invoice Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 35 PM" src="https://github.com/user-attachments/assets/e611c547-8f81-4205-be02-c65087da14a3" />

### All Invoice Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 44 PM" src="https://github.com/user-attachments/assets/6a1e7025-5fa2-4d6f-8362-6a17acb15803" />

### PDF Invoice

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 37 32 PM" src="https://github.com/user-attachments/assets/75e6f1d6-1247-4919-bb0c-c71537c6875d" />

### Salesperson Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 51 PM" src="https://github.com/user-attachments/assets/e915e3f0-ae6a-4cf6-9c4b-4d96e2d876bf" />

### Bank Account Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 36 58 PM" src="https://github.com/user-attachments/assets/e1334988-7290-44e9-b6b1-29d26c5017a8" />

### Report Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 37 05 PM" src="https://github.com/user-attachments/assets/1695808f-9316-43e4-899b-4897c614c1fb" />

### User Management Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 37 12 PM" src="https://github.com/user-attachments/assets/6c1a4093-6931-47f4-a75a-762b7d0764da" />

### Settings Page

<img width="1470" height="956" alt="Screenshot 2025-11-27 at 4 37 19 PM" src="https://github.com/user-attachments/assets/31791f88-ed6c-4d68-8a35-4e93a2c86ae8" />


---

## Getting Started

### Prerequisites

* Node.js 16+
* npm or yarn

### Installation

```bash
git clone https://github.com/abrarhasanch/bttal-app.git
cd bttal-app
npm install
```

---

## Firebase Setup

1. Go to Firebase Console and create a project
2. Enable:

   * Authentication (Email/Password)
   * Firestore Database
3. Create a Web App inside Firebase
4. Copy your Firebase config
5. Paste it into `src/services/firebase.js`

### Optional: Environment Variables

Create `.env.local`:

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

---

## Available Scripts

| Command          | Description             |
| ---------------- | ----------------------- |
| `npm start`      | Run development server  |
| `npm test`       | Run Jest tests          |
| `npm run build`  | Build production bundle |
| `npm run lint`   | Run ESLint              |
| `npm run format` | Format using Prettier   |

---

## Testing Notes

* Jest is configured to mock Firebase modules
* Utility tests are located in `src/utils/`
* Run all tests with:

  ```bash
  npm test
  ```

---

## Deployment Options

### Netlify

* Build command: `npm run build`
* Publish folder: `build/`
* Add environment variables from Firebase

### Vercel

* Import repo
* Build: `npm run build`
* Output: `build/`

### Firebase Hosting

```bash
firebase init hosting
npm run build
firebase deploy
```

### GitHub Pages

(Not ideal for Firebase apps, but possible for static-only builds)

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## Contact

**Abrar Hasan Chowdhury**
GitHub: [https://github.com/abrarhasanch](https://github.com/abrarhasanch)

