const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) return console.log("DB connection error:", err);
  console.log("Connected to MySQL");
});

// SIGNIN
app.post("/signin", (req, res) => {
  const q = "SELECT * FROM admins WHERE email = ? AND password = ?";
  const values = [req.body.email, req.body.password];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length > 0) return res.status(200).json({ user: data[0] });
    return res.status(401).json({ message: "Invalid credentials" });
  });
});

// GET USERS by store
app.get("/users", (req, res) => {
  const q = "SELECT * FROM users WHERE store_id = ? ORDER BY id DESC";
  db.query(q, [req.query.store_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ users: data });
  });
});

// ADD USER
app.post("/adduser", (req, res) => {
  const { name, phone, email, balance, store_id } = req.body;

  const q =
    "INSERT INTO users (name, phone, email, balance, store_id) VALUES (?, ?, ?, ?, ?)";

  db.query(q, [name, phone, email, balance, store_id], (err, result) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json({
      user: {
        id: result.insertId,
        name,
        phone,
        email,
        balance,
        store_id,
      },
    });
  });
});

// UPDATE BALANCE (payment)
app.put("/users/:id/balance", (req, res) => {
  const q = "UPDATE users SET balance = ? WHERE id = ?";
  db.query(q, [req.body.balance, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ balance: req.body.balance });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
