const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error("Database error:", err.message);
  else console.log("Connected to SQLite database.");
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT
)`);

// --------------------- SIGNUP ---------------------
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");

    stmt.run(username, email, hashedPassword, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint")) {
          return res.status(400).json({ message: "Username or email already exists" });
        }
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "User created successfully", username, id: this.lastID });
    });

    stmt.finalize();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------- LOGIN ---------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, row.password);
    if (match) {
      res.json({ message: "Login successful", username: row.username });
    } else {
      res.status(400).json({ message: "Incorrect password" });
    }
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
