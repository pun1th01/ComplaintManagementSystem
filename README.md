# SMART PG 🏢✨
> **The Future of AI-Driven Hostel & PG Management**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq_Llama_3-f59e0b?style=for-the-badge)

---

## 📖 The Problem & Our Solution
Traditional hostel management is broken. Students are forced into random rooms with incompatible roommates, leading to endless conflicts over sleep schedules and lifestyle habits. Meanwhile, wardens drown in disorganized, handwritten maintenance complaints, struggling to prioritize urgent hazards (like electrical fires) over minor inconveniences.

**SMART PG** revolutionizes this process. We built an end-to-end, intelligent platform that guarantees 100% roommate compatibility via an AI Matchmaker algorithm, while simultaneously arming Wardens with a live, auto-triaging dashboard powered by multimodal Vision AI to analyze and prioritize student complaints instantly.

---

## 🚀 Key Features

### 🤝 AI Roommate Matchmaker
Students input their Course, Year, Sleep Schedule (Early Bird/Night Owl), and Dietary Preferences. Our backend algorithm dynamically calculates compatibility scores against existing room occupants and visually recommends the Top 3 perfect rooms in real-time.

### 🛏️ Strict Room/Bed Architecture
A rigid, scalable database architecture where every Room contains exactly 4 uniquely identifiable Beds (Upper/Lower decks). The interactive UI maps available beds in Green and occupied beds in Red, instantly freezing a bed globally the moment it is booked.

### 👁️ Visual AI Ticket Triage
When a student uploads a photo of a maintenance issue (e.g., a broken pipe), our backend pipes the image and description through **Groq's Llama-3-Vision** model. The AI automatically categorizes the issue (Plumbing, Electrical, IT), assigns a 1-10 priority danger score, and generates a concise 1-sentence summary for the Warden.

### 🚨 Live Warden Dashboard
A mission-control interface for hostel staff featuring a 5-second polling loop. It automatically sorts the complaint Triage Table by AI-determined urgency, allowing Wardens to assign staff (Electricians, Plumbers) with a single click. It also features a dedicated Student Management tab to oversee hostel allotments and payment statuses.

### 💳 DONTPAY Simulated Gateway
A seamless, UX-optimized mock payment gateway that simulates a 256-bit encrypted transaction with a 2-second processing delay before successfully locking in the student's bed and updating their status to `Completed`.

---

## 💻 Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts (for Analytics), Lucide Icons
- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL (hosted on Neon.tech)
- **AI Integration:** Groq API (`llama-3.2-11b-vision-preview` & `llama-3.3-70b-versatile`)

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/pun1th01/ComplaintManagementSystem
cd ComplaintManagementSystem
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Run Database Migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Seed the database with mock rooms and students for testing
python manage.py seed_rooms
python manage.py seed_students

# Start the Server
python manage.py runserver
```
*The backend will run on `http://127.0.0.1:8000/`*

### 3. Frontend Setup (React)
Open a **new** terminal window:
```bash
cd frontend

# Install Dependencies
npm install

# Start the Development Server
npm run dev
```
*The frontend will run on `http://localhost:5173/`*

---

## 🔐 Environment Variables

Create a `.env` file in the `/backend/` directory with the following keys:

```env
# /backend/.env

# Your Groq API Key for the Llama Vision & Text Models
GROQ_API_KEY=gsk_your_api_key_here

# Your Neon.tech PostgreSQL Database URL
DATABASE_URL=postgresql://user:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/dbname?sslmode=require

# Django Security Key
SECRET_KEY=django-insecure-your-secret-key-here

# Set to False in production
DEBUG=True
```

---
*Built with ❤️ under intense pressure for the hackathon.*