# 🎬 MovieVault

MovieVault is a Netflix-style movie recommender web app with a sleek **dark + glassmorphism UI**.  
It allows users to **sign up, log in, browse random movies, add favorites, save to watch later, and rate movies**.

---

## 🚀 Features
- 🔐 User authentication (Sign up / Login / Logout)
- 🎥 Random movie posters auto-fetched from TMDb API
- ❤️ Add to Favorites
- ⏰ Save to Watch Later
- ⭐ Rate movies
- ✨ Hover effects with smooth animations
- 📱 Responsive dashboard-style layout

---

## 📂 Project Structure
MovieVault/
│
├── backend/ # Node.js + Express + SQLite
│ ├── server.js # API server
│ ├── users.db # SQLite database (auto-created)
│ └── package.json
│
├── frontend/ # Static frontend
│ ├── index.html
│ ├── style.css
│ └── script.js
│
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/rahul1842/MovieVault.git
cd MovieVault

## ⚙️ Setup Backend
cd backend
npm install
node server.js
Server will run at 👉 http://localhost:5000

## ⚙️ Setup Frontend
Simply open frontend/index.html in your browser
(or use Live Server extension in VS Code).



🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript (Vanilla)
Backend: Node.js, Express
Database: SQLite
Auth: bcrypt (password hashing)
API: TMDb (for movie posters)



Thank YOU!!!