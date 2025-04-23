const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser"); // Add body-parser for request body parsing

const config = require("./src/config/config.js").development;
const app = express();
const PORT = 5000;

// CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// MySQL connection
const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  //port: config.port,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
    return;
  }
  console.log("Connected to MySQL database!");
});

// first get comment
app.get("/user", (req, res) => {
  const sql = "SELECT * FROM userdetails";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// POST route for login
app.post("/user/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  // Check if the email and password are in the DB
  const sql = "SELECT * FROM userdetails WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const user = result[0];

    if (password !== user.password) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      email: user.email,
      id: user.id,
    });
  });
});

//language getting query
app.get("/languages", (req, res) => {
  const sql = "SELECT * FROM languages";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// ✅ CHECK MENTOR ELIGIBILITY
app.get("/mentor/eligible/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT l.id as language_id, l.name, sl.level
    FROM student_levels sl
    JOIN languages l ON sl.language_id = l.id
    WHERE sl.user_id = ? AND sl.level >= 3
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(result); // languages user is eligible to mentor
  });
});

// 📤 REQUEST TO BECOME A MENTOR
app.post("/mentor/request", (req, res) => {
  const { user_id, language_id } = req.body;
  const sql = `INSERT INTO mentor_requests (user_id, language_id) VALUES (?, ?)`;
  db.query(sql, [user_id, language_id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json({ message: "Mentor request submitted" });
  });
});

// 🧑‍🏫 FACULTY VIEW PENDING MENTOR REQUESTS
app.get("/faculty/requests", (req, res) => {
  const sql = `
    SELECT mr.id, u.username, l.name AS language, sl.level
    FROM mentor_requests mr
    JOIN userdetails u ON mr.user_id = u.id
    JOIN languages l ON mr.language_id = l.id
    JOIN student_levels sl ON sl.user_id = mr.user_id AND sl.language_id = mr.language_id
    WHERE mr.status = 'pending'
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// ✅ FACULTY APPROVES MENTOR REQUEST
app.put("/faculty/approve", (req, res) => {
  const { request_id } = req.body;
  const sql = `UPDATE mentor_requests SET status = 'approved' WHERE id = ?`;
  db.query(sql, [request_id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json({ message: "Request approved" });
  });
});

// 👀 STUDENTS SEE APPROVED MENTORS FOR A LANGUAGE
app.get("/mentors/:languageId/:userLevel", (req, res) => {
  const { languageId, userLevel } = req.params;
  const sql = `
    SELECT u.id, u.username, sl.level
    FROM mentor_requests mr
    JOIN userdetails u ON mr.user_id = u.id
    JOIN student_levels sl ON sl.user_id = mr.user_id AND sl.language_id = mr.language_id
    WHERE mr.status = 'approved' AND mr.language_id = ? AND sl.level >= ?
  `;
  db.query(sql, [languageId, parseInt(userLevel) + 2], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// 🙋 STUDENT SELECTS MENTOR
app.post("/mentor/select", (req, res) => {
  const { mentor_id, mentee_id, language_id } = req.body;

  // Calculate next Sunday and end date (Saturday)
  const today = new Date();
  const day = today.getDay();
  const daysUntilSunday = (7 - day) % 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilSunday);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 7-day mentorship

  const formatDate = (d) => d.toISOString().split("T")[0];

  // Check if mentor has 10 mentees already
  const countQuery = `SELECT COUNT(*) AS count FROM mentorships WHERE mentor_id = ? AND language_id = ? AND status = 'ongoing'`;
  db.query(countQuery, [mentor_id, language_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result[0].count >= 10) {
      return res.status(400).json({ message: "Mentor already has 10 mentees" });
    }

    // Insert mentorship record
    const insertQuery = `
      INSERT INTO mentorships (mentor_id, mentee_id, language_id, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, 'ongoing')
    `;
    db.query(
      insertQuery,
      [
        mentor_id,
        mentee_id,
        language_id,
        formatDate(startDate),
        formatDate(endDate),
      ],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Insert failed" });
        res.status(200).json({ message: "Mentor assigned" });
      }
    );
  });
});

// 📃 MENTOR SEES MENTEE LIST
app.get("/mentor/mentees/:mentorId", (req, res) => {
  const { mentorId } = req.params;
  const sql = `
    SELECT u.username AS mentee_name, sl.level, l.name AS language, m.start_date, m.end_date, m.status
    FROM mentorships m
    JOIN userdetails u ON m.mentee_id = u.id
    JOIN student_levels sl ON sl.user_id = u.id AND sl.language_id = m.language_id
    JOIN languages l ON m.language_id = l.id
    WHERE m.mentor_id = ?
  `;
  db.query(sql, [mentorId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(result);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
