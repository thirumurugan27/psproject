const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.query(
    "SELECT * FROM userdetails WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Invalid Credentials" });

      const user = result[0];
      if (user.password !== password)
        return res.status(401).json({ message: "Invalid password" });

      res.json({
        message: "Login successful",
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  );
});

module.exports = router;