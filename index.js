const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // optional if empty
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.post("/signin", (req, res) => {
  const q = "SELECT * FROM admins WHERE email = ? AND password = ?";
  const values = [req.body.email, req.body.password];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      return res.status(200).json({
        message: "Signin successful",
        user: data[0],
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  });
});

app.post("/adduser", (req, res) => {
  const q =
    "INSERT INTO users (name,phone,email,balance,store_id) VALUES (?, ?, ?, ?, ?)";

  const values = [
    req.body.name,
    req.body.phone,
    req.body.email,
    req.body.balance,
    req.body.store_id,
  ];

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json(err);

    // result.affectedRows will be 1 if inserted
    if (result.affectedRows === 1) {
      return res.status(200).json({
        message: "successfully added user",
        user: {
          id: result.insertId,
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          balance: req.body.balance,
          store_id: req.body.store_id,
        },
      });
    }

    return res.status(400).json({ message: "something went wrong" });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
