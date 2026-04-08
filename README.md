# ✈️ ATC-DSS — Air Traffic Control Decision Support System

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3-green)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue)](https://sqlite.org/)

---

## 🎯 Overview

ATC-DSS is a **simulation-based Air Traffic Control Decision Support System** that provides real-time radar visualization, conflict detection, and Rule-based decision support system.

---

## ✨ Features

- 🛰️ **Real-time Radar** — Live aircraft tracking with simulated movement  
- ⚠️ **Conflict Detection** — Detects proximity violations using distance & altitude rules  
- 💡 **Decision Support** — Suggests actions to resolve conflicts  
- 🎙️ **Voice Commands** — Simulated ATC announcements  
- 🗄️ **Persistent Storage** — SQLite database for aircraft data  
- 📊 **Logs & History** — Tracks conflicts and system actions  

---

## 🏗️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Canvas API  
- **Backend:** Flask, SQLite, Flask-CORS  

---

## 📁 Project Structure

```text
atc-dss/
├── frontend/     # React app (Port: 3000)
└── backend/      # Flask API (Port: 5000)
```

---

## 🚀 Quick Start

### 🔹 Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

---

### 🔹 Installation

#### 1. Clone Repository

```bash
git clone https://github.com/navya-0510/ATC-DSS.git
cd ATC-DSS
```

---

#### 2. Setup Backend

```bash
cd backend
pip install flask flask-cors
python app_sqlite.py
```

---

#### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 🔹 Run Application

- Frontend → http://localhost:3000  
- Backend → http://localhost:5000  

---

## 📖 Usage

| Action              | Description |
|--------------------|------------|
| Add Aircraft       | Click "+ ADD AIRCRAFT" |
| Resolve Conflict   | Click "ISSUE ATC COMMAND" |
| Edit Aircraft      | Modify via Flight Plan panel |
| View Logs          | Check Alerts & Logs section |

---

## 📡 API Endpoints

| Method | Endpoint              | Description            |
|--------|----------------------|------------------------|
| GET    | /api/aircraft        | Fetch all aircraft     |
| POST   | /api/aircraft        | Add new aircraft       |
| PUT    | /api/aircraft/{id}   | Update aircraft        |
| DELETE | /api/aircraft/{id}   | Delete aircraft        |
| GET    | /api/conflicts       | Detect conflicts       |

---

## 🔧 Configuration

Modify in `app_sqlite.py`:

- Distance threshold (default: 100 units)  
- Altitude threshold (default: 2000 ft)  
- Server port (default: 5000)  

---

## 🐛 Troubleshooting

- **Port 5000 in use** → Change port in backend  
- **No aircraft visible** → Refresh from backend  
- **Voice not working** → Requires user interaction in browser  

---

## 📝 License

MIT

---

## ⚡ Notes

This project focuses on **simulation and rule-based logic**, not machine learning.

---

Built for ATC simulation and system design ✈️
