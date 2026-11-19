
# 🛡️ InternShield AI

### AI-Powered Internship Fraud Detection Platform

**Built by ByteSentinels** | Developed by Kushagra Bajpai

**Live website:** [https://internshield-ai-qkim.onrender.com/](https://internshield-ai-qkim.onrender.com/)

InternShield AI is a web platform designed to help students assess internship opportunities, identify potential warning signs, and make more informed career decisions.

Requires Node.js 24.12.0 or newer.

Our goal is to make internship research safer by encouraging students to review suspicious requests, verify employer information, and recognize common recruitment scam indicators.

---

## ✨ Features

- 🔐 **User Authentication** — Account registration and login powered by Firebase Authentication.
- 🛡️ **Internship Risk Assessment** — Review internship information and identify potential warning signs.
- 🔎 **Suspicious Pattern Awareness** — Highlight concerns such as upfront payment requests, unrealistic guarantees, and pressure tactics.
- 📋 **Structured Reviews** — Organize internship details to support more informed decisions.
- 📱 **Responsive Interface** — Modern interface designed for desktop and mobile screens.
- 🎨 **Modern UI** — Dark-themed interface with violet and cyan accents.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| Firebase Authentication | User account management |
| Neon PostgreSQL | Persistent report and verification data |
| Google Web Risk | Optional URL threat-list lookup (free monthly usage capped by the app) |
| Git & GitHub | Version control and collaboration |

## 📂 Project Structure

```text
internshield-ai/
├── app/
│   ├── contact/
│   ├── login/
│   ├── signup/
│   ├── verify/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── app/api/
│   ├── analyze/
│   └── reports/
├── db/
│   └── schema.sql
├── lib/
│   ├── db.ts
│   └── firebase-server-auth.ts
├── public/
│   └── logo.png
├── .env.local
├── package.json
└── README.md
```

> `.env.local` contains local configuration and must not be committed to GitHub. Keep it listed in `.gitignore`.

## ⚙️ Getting Started

Use Node.js 24.12 or newer for the installed Firebase SDK version.

### 1. Clone the repository

```bash
git clone https://github.com/KushagraTechie/internshield-ai.git
cd internshield-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env.local` file in the project root, alongside `package.json`.

Add your Firebase web app configuration:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL="InternShield AI <reports@your-verified-domain.com>"
WEB_RISK_API_KEY=your_google_cloud_web_risk_api_key
```

Replace the example values with your own Firebase project configuration. Never upload `.env.local` or private service-account credentials.

In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
New accounts receive a verification link, and the analysis API checks the verified status on the server before processing an opportunity.

For profile-photo uploads, create/enable the Firebase Storage bucket and publish the owner-only rules from `storage.rules` in Firebase Console → Storage → Rules. Firebase currently requires the pay-as-you-go Blaze plan for Cloud Storage; usage may incur charges if it exceeds included no-cost usage. Do not upgrade billing unless you are comfortable with that plan.

### 4. Configure Neon PostgreSQL

Create or select a Neon project, copy its pooled PostgreSQL connection string from the Neon dashboard, and add it to the local `.env.local` file. Keep the value server-only; do not add a `NEXT_PUBLIC_` prefix or commit it.

```dotenv
DATABASE_URL=your_neon_pooled_connection_string
```

From the project folder, run `npm run db:migrate` to create the users, companies, analysis reports, verification records, and audit logs tables in Neon. The migration uses `CREATE TABLE IF NOT EXISTS` and can be rerun safely.

The optional website reputation check uses Google Web Risk Lookup. Create an API key in Google Cloud for the Web Risk API and set `WEB_RISK_API_KEY` in the server environment. Application URLs are sent to Google for this lookup when configured. The app reserves at most 75,000 lookups per calendar month in Neon to stay under Google's currently published 100,000 free monthly lookups; keep this key dedicated to this app, since Google's quota can also be consumed by other uses of the same project. Running `npm run db:migrate` adds the monthly usage counter. If no key is set, or the app's cap is reached, the rest of the website checks still run and the report says the reputation lookup was not completed. Do not enable billing or accept a paid plan to set this up without reviewing Google's current terms first.

Run `npm run db:smoke` to verify report insertion, user-specific history, and individual report retrieval. It creates and removes a synthetic test record.

### 5. Profile photos and PDF email

Profile-photo uploads need a Firebase Storage bucket. In Firebase Console → Build → Storage, create the project's bucket, make sure its name matches `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in `.env.local`, then publish the included `storage.rules` rules. The app previews a selected image, displays upload progress, and reports missing-bucket or rules errors instead of leaving the upload spinner running. Firebase may ask you to enable billing to create a Storage bucket; review its current terms before accepting.

PDF downloads are generated by the app. To automatically email a PDF after analysis or send it later from report history, create a Resend account, verify a sender domain/address, then add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local` and the deployment provider's server-side environment settings. Keep the API key private. Restart the development server after changing `.env.local`. The analysis form includes an on-by-default email option that users can switch off; account owners can also download or resend saved PDFs from their report history. The app now shows the email provider's reason when a send is rejected.

After a new user confirms their Firebase email, the app sends a branded welcome email with the InternShield logo. Neon stores a send marker so repeated visits do not send duplicate welcome emails. Run `npm run db:migrate` after updating so existing Neon databases receive the new marker columns. Resend's `onboarding@resend.dev` sender is restricted to test delivery to the Resend account address; to email other users, verify a domain in Resend and set `RESEND_FROM_EMAIL` to an address on that domain. The welcome and report emails include the logo inline and use the configured verified sender.

The previous local SQLite file at `data/internshield.sqlite` is retained as a backup. It contained no saved reports when this migration was prepared. This project did not contain a MongoDB integration to migrate.

### 6. Start the development server

```bash
npm run dev
```

The live app is [https://internshield-ai-qkim.onrender.com/](https://internshield-ai-qkim.onrender.com/). For a local preview, open the address printed by `npm run dev`.

## 🔐 Security Notes

- Firebase Authentication manages user registration and sign-in.
- Server routes verify Firebase ID tokens before accessing user-specific Neon data.
- `DATABASE_URL` is server-only and must never be exposed to the browser.
- `/api/reports` lists the signed-in user's reports; `/api/reports/[id]` returns only that user's selected report.
- The verification feature requires a signed-in, email-verified Firebase account. The server checks the Firebase identity before running analysis.
- Report history includes account-owned PDF downloads. Email delivery uses Resend and stays unavailable until `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` are configured in the server environment.
- Client-side route redirects alone are not sufficient for sensitive server-side operations.
- Risk indicators are informational and must not be treated as definitive proof of fraud.
- Real AI-based fraud detection and external internship verification require additional implementation and validation.

## 🗺️ Roadmap

- [x] Initial Next.js application and interface
- [x] Firebase web app configuration
- [x] Email/password authentication provider setup
- [ ] Complete signup and login integration testing
- [x] Enforce authenticated access to internship verification
- [x] Add secure server-side verification handling
- [x] Store analysis reports and verification records in Neon PostgreSQL
- [ ] Develop and evaluate an AI-based risk analysis system
- [ ] Deploy the production application

## 👨‍💻 Project Information

**Project:** InternShield AI  
**Team:** ByteSentinels  
**Developer:** Kushagra Bajpai

- **GitHub:** [KushagraTechie](https://github.com/KushagraTechie)
- **LinkedIn:** [Kushagra Bajpai](https://www.linkedin.com/in/kushagra-bajpai-180187320/)
- **Repository:** [internshield-ai](https://github.com/KushagraTechie/internshield-ai)

## ⚠️ Disclaimer

InternShield AI is a developing project intended to help students assess potential internship risks. Its indicators do not guarantee that an opportunity is legitimate or fraudulent. Always independently verify employers and never pay unexpected recruitment fees without careful investigation.

---

<p align="center">
  Built with 💜 by <strong>ByteSentinels</strong>
</p>
