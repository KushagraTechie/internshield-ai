
# 🛡️ InternShield AI

### AI-Powered Internship Fraud Detection Platform

**Built by ByteSentinels** | Developed by Kushagra Bajpai

InternShield AI is a web platform designed to help students assess internship opportunities, identify potential warning signs, and make more informed career decisions.

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
├── lib/
│   └── firebase.ts
├── public/
│   └── logo.png
├── .env.local
├── package.json
└── README.md
```

> `.env.local` contains local configuration and must not be committed to GitHub. Keep it listed in `.gitignore`.

## ⚙️ Getting Started

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
```

Replace the example values with your own Firebase project configuration. Never upload `.env.local` or private service-account credentials.

In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Security Notes

- Firebase Authentication manages user registration and sign-in.
- The verification feature must be protected so unauthenticated visitors cannot use it.
- Client-side route redirects alone are not sufficient for sensitive server-side operations.
- Risk indicators are informational and must not be treated as definitive proof of fraud.
- Real AI-based fraud detection and external internship verification require additional implementation and validation.

## 🗺️ Roadmap

- [x] Initial Next.js application and interface
- [x] Firebase web app configuration
- [x] Email/password authentication provider setup
- [ ] Complete signup and login integration testing
- [ ] Enforce authenticated access to internship verification
- [ ] Add secure server-side verification handling
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
