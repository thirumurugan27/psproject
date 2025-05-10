const express = require("express");
const router = express.Router();
const db = require("../db");


//available mentors for a student
router.get("/mentors/:student_email", (req, res) => {
  const student_email = req.params.student_email;

  // Check if student is already mentor, mentee, or has pending mentor request
  const checkSql = `
    SELECT student_email AS email FROM mentors WHERE student_email = ?
    UNION
    SELECT mentee_email AS email FROM mentees WHERE mentee_email = ? AND status = 'ongoing'
    UNION
    SELECT student_email AS email FROM mentor_requests WHERE student_email = ? AND status = 'pending'
  `;

  db.query(
    checkSql,
    [student_email, student_email, student_email],
    (err0, existing) => {
      if (err0) return res.status(500).json({ error: "Check error" });

      if (existing.length > 0) {
        // Student is already a mentor, mentee, or has pending mentor request
        return res.status(200).json([]);
      }

      // Get student levels
      db.query(
        "SELECT * FROM student_levels WHERE student_email = ?",
        [student_email],
        (err1, levels) => {
          if (err1) return res.status(500).json({ error: "Level fetch error" });

          const studentLevels = {};
          levels.forEach((row) => {
            studentLevels[row.language_name] = row.level;
          });

          // Get mentors and their mentee counts
          const sql = `
          SELECT 
            m.student_email AS mentor_email, 
            u.name AS mentor_name, 
            m.language_name, 
            sl.level AS mentor_level,
            COUNT(me.mentee_email) AS mentee_count
          FROM mentors m
          JOIN userdetails u ON u.email = m.student_email
          JOIN student_levels sl ON sl.student_email = m.student_email AND sl.language_name = m.language_name
          LEFT JOIN mentees me ON me.mentor_email = m.student_email 
            AND me.language_name = m.language_name 
            AND me.status = 'ongoing'
          GROUP BY m.student_email, m.language_name
        `;

          db.query(sql, (err2, mentors) => {
            if (err2)
              return res.status(500).json({ error: "Mentor fetch error" });

            const filtered = mentors
              .filter((m) => {
                const studentLevel = studentLevels[m.language_name] || 0;
                return (
                  m.mentor_email !== student_email &&
                  m.mentor_level >= studentLevel + 2 &&
                  m.mentee_count < 10
                );
              })
              .map((m) => ({
                mentor_name: m.mentor_name,
                language_name: m.language_name,
                mentor_level: m.mentor_level,
                mentor_email: m.mentor_email,
              }));

            res.json(filtered);
          });
        }
      );
    }
  );
});


// POST mentee request to mentor
router.post("/request", (req, res) => {
  const { student_email, mentor_email, language_name } = req.body;

  if (!student_email || !mentor_email || !language_name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const checkQuery =
    "SELECT * FROM mentee_requests WHERE student_email = ? AND language_name = ?";
  db.query(checkQuery, [student_email, language_name], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Request for this language already exists" });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const insertQuery =
      "INSERT INTO mentee_requests (student_email, mentor_email, language_name, request_date) VALUES (?, ?, ?, ?)";

    db.query(
      insertQuery,
      [student_email, mentor_email, language_name, today],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        return res
          .status(201)
          .json({ message: "Mentee request sent successfully" });
      }
    );
  });
});


//to get mentor detail
router.get("/mentor-detail/:email", (req, res) => {
  const menteeEmail = req.params.email;

  const sql = `
    SELECT 
      m.mentor_email,
      u.name AS mentor_name,
      m.language_name,
      sl.level AS mentor_level,
      m.start_date,
      m.end_date,
      m.status
    FROM mentees m
    JOIN userdetails u ON u.email = m.mentor_email
    JOIN student_levels sl ON sl.student_email = m.mentor_email AND sl.language_name = m.language_name
    WHERE m.mentee_email = ?
  `;

  db.query(sql, [menteeEmail], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    if (results.length === 0) {
      return res.status(200).json({ message: "No mentee history found" }); //404 to 200
      // "mentor_email": "thirumurugank.al24@bitsathy.ac.in",
      // "mentor_name": "Thirumurugan K",
      // "language_name": "C",
      // "mentor_level": 6,
      // "start_date": "27-04-2025",
      // "end_date": "03-05-2025",
      // "status": "ongoing"
    }

    // Format start_date and end_date nicely
    const formattedResults = results.map((record) => ({
      ...record,
      start_date: formatDate(record.start_date),
      end_date: formatDate(record.end_date),
    }));

    res.json(formattedResults);
  });
});


// Helper function for date formatting
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}


//⭐⭐⭐⭐⭐ Feedback and Rating to mentor
router.post('/feedback', (req, res) => {
  const { mentor_email, mentee_email, language_name, rating, feedback } = req.body;

  if (!mentor_email || !mentee_email || !language_name || !rating || !feedback) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
    INSERT INTO mentor_feedback 
    (mentor_email, mentee_email, language_name, rating, feedback) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [mentor_email, mentee_email, language_name, rating, feedback], (err, result) => {
    if (err) {
      console.error('Error posting mentor feedback:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.status(200).json({ message: 'feedback to mentor by mentee submitted successfully' });
  });
});




module.exports = router;