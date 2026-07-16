<div align="center">

<h3 align="center"> <img src="frontend/src/assets/Logo.png" width="66"/> <br>
Cincrafit AI </h3>

### Building Trusted Commerce for Bharat using Agentic AI

*An AI-powered commerce verification platform that helps consumers discover verified offers while enabling merchants to securely publish authentic promotional campaigns.*

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Groq](https://img.shields.io/badge/Groq-LLM-red)
![RAG](https://img.shields.io/badge/RAG-Powered-purple)
![License](https://img.shields.io/badge/License-MIT-success)

</div>

---

# 📖 Overview

Cincrafit AI is a **Bharat-first Agentic Commerce Verification Platform** designed to solve one of the biggest problems in digital commerce-**fake coupons, expired deals, and unreliable promotional information**.

Instead of acting as a traditional coupon-sharing website, Cincrafit AI combines **Retrieval-Augmented Generation (RAG), AI Agents, merchant verification, conversational AI, and multilingual accessibility** to deliver trusted commerce experiences for both consumers and merchants.

The platform creates a bridge between **verified businesses** and **consumers**, ensuring that only authenticated promotional campaigns become visible.

---

# 🎯 Problem Statement

Consumers frequently encounter:

- ❌ Fake coupon codes
- ❌ Expired promotional offers
- ❌ Unverified discounts
- ❌ Fragmented deal discovery

Meanwhile, merchants and MSMEs struggle to:

- Reach local consumers
- Promote authentic campaigns
- Build consumer trust
- Increase discoverability

Cincrafit AI addresses both sides of this ecosystem through an AI-driven verification workflow.

---

# ✨ Key Features

## 👥 Consumer Features

- 🤖 Conversational AI Search
- 🎟️ Verified Deals & Coupons
- 🍔 Food Offers
- 🎬 Movie Discounts
- 👕 Fashion Deals
- 🌍 Multilingual Support
- 🎤 Voice Search (Web Speech API)
- 💬 Persistent Chat History
- 🔍 AI-powered Offer Verification
- 📱 Responsive UI

---

## 🏢 Merchant Features

- 🔐 Merchant Authentication
- 🧾 Business Verification Workflow
- 📄 PDF Campaign Upload
- ☁️ Cloudinary PDF Storage
- 📑 Automatic PDF Text Extraction
- 🧠 Merchant Test Mode
- 💬 AI Testing using Uploaded PDFs
- 📊 Campaign History
- 🗑 Delete Campaigns
- ✅ Merchant Approval Workflow

---

## 👨‍💼 Admin Features

- 🔑 Admin Dashboard
- 🏢 Merchant Review
- ✅ Approve Merchants
- ❌ Reject Merchants
- 📈 Trust Score Review
- 🔄 Real-time Merchant Status Updates

---

# 🧠 Agentic AI Architecture

Cincrafit AI follows an Agent-based architecture where multiple intelligent components work together.

```
                User Query
                     │
                     ▼
             Route Agent
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Movie Agent    Fashion Agent    Food Agent
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
             RAG Retrieval Engine
                     │
                     ▼
              Groq Llama 3.1
                     │
                     ▼
              Verified Response
```

---

# 🏗 Merchant Workflow

```
Merchant Login
      │
      ▼
Business Verification
      │
      ▼
Merchant Approved
      │
      ▼
Test Mode Access
      │
      ▼
Upload PDF
      │
      ▼
PDF Parsing
      │
      ▼
Extracted Text Stored
      │
      ▼
Merchant Tests AI
      │
      ▼
Approve Dataset
      │
      ▼
Consumer AI Uses Verified Dataset
```

---

# 🧠 AI Workflow

```
User Question

↓

Route Agent

↓

Detect Domain

↓

Retrieve Verified Context

↓

RAG Prompt

↓

Groq Llama

↓

Verified AI Response
```

---

# 💻 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- React Router
- Framer Motion
- Web Speech API

---

## Backend

- Node.js
- Express.js
- REST APIs

---

## AI

- Groq API
- Llama 3.1 Instant
- Retrieval-Augmented Generation (RAG)

---

## Database

- Firebase Authentication
- Cloud Firestore

---

## Storage

- Cloudinary
- PDF Parse

---

## Authentication

- Firebase Authentication
- Google Sign-In
- Merchant Verification
- Admin Authorization

---

# 📂 Project Structure

```
frontend/
│
├── components/
├── pages/
├── context/
├── services/
├── assets/

backend/
│
├── routes/
├── middleware/
├── services/
├── utils/
├── data/
├── firebase.js
└── server.js
```

---

# 🚀 Major Project Upgrades

Compared to the Minor Project version, the following major enhancements were added:

- ✅ Merchant Portal
- ✅ Admin Dashboard
- ✅ Merchant Verification System
- ✅ Test Mode
- ✅ Cloudinary Integration
- ✅ PDF Upload & Parsing
- ✅ Merchant-specific AI Chat
- ✅ Campaign Approval Workflow
- ✅ Persistent Chat Management
- ✅ Rename/Delete Chat Persistence
- ✅ AI Dataset Approval
- ✅ Secure Role-based Authentication

---

# 🔐 Security Features

- Firebase Authentication
- Protected API Routes
- JWT Verification
- Merchant Verification Pipeline
- Admin-only Dashboard
- Role-based Access Control
- Verified Dataset Isolation

---

# 🌍 Future Roadmap

- 📍 Hyperlocal Business Discovery
- 🤖 AI-generated Promotional PDFs
- ✏️ Editable Smart Campaigns
- 📊 Merchant Trust Index
- ⭐ Consumer Feedback Verification
- 🏪 Enterprise API Integration
- 🌐 More Indian Languages
- 📈 Analytics Dashboard

---

# Website Pages
- Home Page
- Movie Offers
- Food Offers
- Fashion Deals
- Merchant Test Mode
- Admin Dashboard
- Merchant Verification
- AI Chat Interface

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/cincrafit-ai.git

cd cincrafit-ai
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Backend `.env`

```env
GROQ_API_KEY=

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SERPAPI_KEY=

ADMIN_EMAILS=
```

---

# 👨‍💻 Team

**Novaco-TechArts**

Building AI solutions for Bharat 🇮🇳

---

# Built With

- React
- Node.js
- Firebase
- Groq AI
- Cloudinary
- Tailwind CSS
- Agentic AI
- Retrieval-Augmented Generation (RAG)

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you like this project, don't forget to Star the repository!

Made by **Novaco-TechArts**

</div>
