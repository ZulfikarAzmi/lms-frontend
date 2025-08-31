# 📚 Mini LMS with IBM Granite Assistant

## 📖 About Project
This project is a **Mini Learning Management System (LMS)** designed to help users learn through structured courses and quizzes.  
It is built with **React** as the frontend framework, **Firebase** for authentication and database, **TailwindCSS** for styling, and supported by **IBM Granite** as an AI assistant for code generation, refactoring, and debugging.  

---

## 🚀 Tech Stack
- **React.js** → Frontend interface and user interaction  
- **Firebase** → Authentication, Firestore Database, Hosting  
- **TailwindCSS** → Modern and responsive styling  
- **IBM Granite** → AI-powered code generation, debugging, and optimization  

---

## ✨ Features
- 👤 **User Authentication** (Login/Register with Firebase Auth)  
- 📚 **Course Management** (create, view, and manage courses)  
- 📝 **Quiz Management** (admin can add quizzes for each course)  
- ✅ **Take Quiz** (users must complete quizzes before finishing a course)  
- 📊 **Progress Tracking** (track user progress)  
- 🎨 **Responsive UI** with TailwindCSS  

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/username/mini-lms.git
cd mini-lms
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Firebase
- Create a project in [Firebase Console](https://console.firebase.google.com/)  
- Add your Firebase config to `.env` file  

```env
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
```

### 4. Run the development server
```bash
npm run dev
```

---

## 🚀 Deployment
This project is deployed using **Firebase Hosting**:  
🔗 [https://mini-lms-demo.web.app](https://mini-lms-demo.web.app)
