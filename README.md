# 📸 PhotoPoet – A Visual Storytelling AI Studio




- A futuristic AI-powered photo journaling studio built with Firebase, Next.js, and Tailwind CSS.
- PhotoPoet enables users to generate poetic narratives around images — combining creativity, cloud, and code into an elegant experience.


## 📋 Table of Contents
- Introduction
- Features
- Project Implementation Process
- File Structure
- Technology Stack
- Installation
- Usage
- Screenshots
- Contributing
- License
- Contact

## 📘 Introduction

- PhotoPoet is an AI-powered visual diary that transforms your photographs into beautiful poetry.
- It combines the power of Firebase backend, Genkit AI, and a modern frontend using Next.js and TailwindCSS.
- Whether you're a traveler, creator, or daydreamer — PhotoPoet helps you tell your stories with both image and verse.


## ✨ Features

🧠 AI Storytelling – Generate poetic or narrative text based on images with Genkit AI

⚡ Built with Next.js 15 – Ultra-fast builds with Turbopack and App Router

🎨 Tailwind CSS & Geist UI – Modern, minimal, responsive interface

📦 Firebase Backend – Realtime storage, auth, Firestore support

🌗 Theme Toggle – Dark/light modes using next-themes

📊 Interactive Graphs – Beautiful analytics with Recharts

🪄 Zod + React Hook Form – Safe, typed, and validated user inputs

📤 Deployment Ready – Easily hosted on Vercel with CI/CD setup

## 🛠 Project Implementation Process

#### 1. Design & Layout
- Built with Tailwind CSS utility-first styling
- Custom components using Radix UI and Geist
- Mobile-first and theme-aware interface

#### 2. Backend Integration
- Firebase for auth, Firestore, and image storage
- Environment-safe key handling with dotenv

#### 3. AI + Genkit Integration
- FGoogle AI via Genkit for text generation from image metadata
- Streamlined with genkit CLI and dev tools

#### 4. Forms, Validation, Feedback
- react-hook-form + zod for form validation
- Toasts, modals, sliders using Radix and Tailwind-animate

## 📁 File Structure

```bash
photo-poet/
├── public/                # Static assets (icons, images)
├── src/
│   ├── components/        # UI Components (Header, Footer, Form, etc.)
│   ├── app/               # Next.js App Router pages
│   ├── styles/            # Tailwind and global styles
│   ├── lib/               # Firebase, Genkit, utility functions
│   ├── ai/                # Genkit AI handlers
│   └── types/             # Zod schemas and TS interfaces
├── .env.local             # Environment secrets (Firebase, Genkit)
├── tailwind.config.ts     # Tailwind config
├── vite.config.ts         # Vite/Genkit config
├── next.config.js         # Next.js config
├── package.json
└── README.md
```

## 💻 Technology Stack

Category	Tech Used

⚛️ Frontend	Next.js 15 (App Router + Turbopack)

🎨 Styling	Tailwind CSS, Radix UI, Geist

🧠 AI Integration	Genkit + GoogleAI

🔥 Backend	Firebase (Auth, Firestore, Storage)

📧 Forms & UX	React Hook Form, Zod, Radix, Toast

📊 Data Viz	Recharts

🚀 Deployment	Vercel

🧪 Lint & Type	ESLint, TypeScript

## 🛠 Installation

Follow these steps to set up and run the Techny project locally:

#### 1. Clone the repository
```bash
git clone https://github.com/YourUsername/photo-poet.git
cd photo-poet
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

- Create a .env file in the root and add your EmailJS keys:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Genkit
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
```

#### 4. Run the Development Server

```bash
npm run dev
```

## 🚀 Usage
- Upload an image or select from gallery
- Watch AI generate poetic or narrative text for each image
- Save, edit, or share your visual stories
- Responsive on all devices, with light/dark mode toggle


## 📸 Screenshots

![Screenshot (197)](https://github.com/user-attachments/assets/f5dbb760-9265-474a-b1af-2a5dc6819211)

![Screenshot (198)](https://github.com/user-attachments/assets/9e3880f3-22c0-4e45-8e59-6da509e23585)

![Screenshot (199)](https://github.com/user-attachments/assets/880e610b-ab9c-464e-93cc-622f41c5c293)

![Screenshot (200)](https://github.com/user-attachments/assets/5dd433a2-22af-4ffa-a5c0-1e8983238ecb)

![Screenshot (201)](https://github.com/user-attachments/assets/6323829b-5543-4112-8843-8e152cafd89a)

![Screenshot (202)](https://github.com/user-attachments/assets/353ac4b3-4e69-418e-9380-fe2aee667ce5)

![Screenshot (203)](https://github.com/user-attachments/assets/6865f042-554c-4f17-8df8-7ce80ff84e56)

![Screenshot (204)](https://github.com/user-attachments/assets/fc697d97-8b4e-4bf7-bf01-8b2d8fe1debb)

![Screenshot (205)](https://github.com/user-attachments/assets/499b6ac7-f0bf-4cab-b6d5-9e59b2eddeeb)

![Screenshot (206)](https://github.com/user-attachments/assets/19ce43e7-4f26-47cc-bb86-0f4226024b10)

![Screenshot (207)](https://github.com/user-attachments/assets/d4292753-7856-403d-b077-36156c404ce3)

![Screenshot (208)](https://github.com/user-attachments/assets/49c49f7b-30dc-4054-8b54-132deba71852)

![Screenshot (209)](https://github.com/user-attachments/assets/cafd7db7-6c24-4580-8c4b-c5b535bd7204)


## 🤝 Contributing
We welcome community contributions! Follow the steps below to contribute:

#### Fork the repository
- Create a new branch:
```bash
git checkout -b feature/YourFeature
```

- Commit your changes:
```bash
git commit -m 'Add your feature'
```

- Push to the branch:
```bash
git push origin feature/YourFeature
```

- Open a pull request with detailed explanations of your changes.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact
For any questions or suggestions, feel free to reach out:

- Email: rohansh0808@gmail.com
- GitHub: Rohansh0808
