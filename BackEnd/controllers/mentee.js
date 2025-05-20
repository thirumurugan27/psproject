const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/verifyToken");

//👩‍🏫👨‍🏫available mentors for a student 
router.get("/mentors/:student_email/:language_name", verifyToken, (req, res) => {
  const student_email = req.params.student_email;
  const language_name = req.params.language_name;

  console.log("Received params:", student_email, language_name);

  const checkSql = `
    SELECT student_email AS email FROM mentors WHERE student_email = ?
    UNION
    SELECT mentee_email AS email FROM mentees WHERE mentee_email = ? AND status = 'ongoing'
    UNION
    SELECT student_email AS email FROM mentor_requests WHERE student_email = ? AND status = 'pending'
  `;

  db.query(checkSql, [student_email, student_email, student_email], (err0, existing) => {
    if (err0) {
      console.error("Error in checkSql:", err0);
      return res.status(500).json({ error: "Check error" });
    }

    if (existing.length > 0) {
      return res.status(200).json([]); // Already a mentor/mentee or has pending request
    }

    db.query("SELECT * FROM student_levels WHERE student_email = ?", [student_email], (err1, levels) => {
      if (err1) {
        console.error("Error fetching levels:", err1);
        return res.status(500).json({ error: "Level fetch error" });
      }

      const studentLevels = {};
      levels.forEach((row) => {
        studentLevels[row.language_name] = row.level;
      });

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
        WHERE 
          m.status = 'ongoing' 
          AND m.language_name = ?
          AND m.student_email NOT IN (
            SELECT mentor_email 
            FROM mentee_requests 
            WHERE student_email = ? 
              AND language_name = ? 
              AND status IN ('pending', 'rejected')
          )
        GROUP BY m.student_email, m.language_name, u.name, sl.level
      `;

      db.query(sql, [language_name, student_email, language_name], (err2, mentors) => {
        if (err2) {
          console.error("Error fetching mentors:", err2);
          return res.status(500).json({ error: "Mentor fetch error" });
        }

        const studentLevel = studentLevels[language_name] || 0;

        const filtered = mentors
          .filter((m) =>
            m.mentor_email !== student_email &&
            m.mentor_level >= 2 &&
            m.mentor_level >= studentLevel + 2 &&
            m.mentee_count < 10
          )
          .map((m) => ({
            mentor_name: m.mentor_name,
            language_name: m.language_name,
            mentor_level: m.mentor_level,
            mentor_email: m.mentor_email,
          }));

        res.json(filtered);
      });
    });
  });
});


//📝📚👩‍🏫👨‍🏫POST mentee request to mentor
router.post("/request", verifyToken, (req, res) => {
  const { student_email, mentor_email, language_name } = req.body;

  if (!student_email || !mentor_email || !language_name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const insertQuery = `
    INSERT INTO mentee_requests (student_email, mentor_email, language_name, request_date)
    VALUES (?, ?, ?, ?)
  `;

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


//🔍📋to get mentor detail
router.get("/mentor-detail/:email", verifyToken, (req, res) => {
  const menteeEmail = req.params.email;
  const sql = `
    SELECT 
      m.mentor_email,
      u.name AS mentor_name,
      m.language_name,
      sl.level AS mentor_level,
      m.start_date,
      m.end_date,
      m.status,
      m.menteef
    FROM mentees m
    JOIN userdetails u ON u.email = m.mentor_email
    JOIN student_levels sl ON sl.student_email = m.mentor_email AND sl.language_name = m.language_name
    WHERE m.mentee_email = ? AND m.status = 'ongoing'
  `;

  db.query(sql, [menteeEmail], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    if (results.length === 0) {
      return res.status(200).json([]); //404 to 200
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


// AVG(⭐) .To get the AVERAGE rating of a mentor
router.get('/avg-rating/:mentor_email/:language', verifyToken, (req, res) => {
  const mentorEmail = req.params.mentor_email;
  const language = req.params.language;

  const query = `
      SELECT 
          AVG(rating) AS avg_rating
      FROM 
          mentor_feedback
      WHERE 
          mentor_email = ? AND language_name = ?;
  `;

  db.query(query, [mentorEmail, language], (err, results) => {
    if (err) {
      console.error('Error fetching average rating for mentor by language:', err);
      return res.status(500).send('Internal server error');
    }

    const avgRating = results[0].avg_rating === null ? 0 : Math.floor(results[0].avg_rating);


    return res.send(`${avgRating}`);  // Send just the average rating as a plain number
  });
});


//🚫✋Dont touch this
// Helper function for date formatting
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}


//Booked slot by mentor
router.get("/slot/:mentee_email", verifyToken, (req, res) => {
  const mentee_email = req.params.mentee_email;

  const sql = `
    SELECT * 
    FROM slot 
    WHERE mentee_email = ?  
      AND status = 'ongoing'
  `;

  db.query(sql, [mentee_email], (err, results) => {
    if (err) return res.status(500).json({ error: "Slot fetch error" });
    res.json(results);
  });
});


//⭐⭐⭐⭐⭐ Feedback and Rating to mentor
router.post('/feedback', verifyToken, (req, res) => {
  const { mentor_email, mentee_email, language_name, rating, feedback } = req.body;

  if (!mentor_email || !mentee_email || !language_name || !rating || !feedback) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const insertQuery = `
    INSERT INTO mentor_feedback 
    (mentor_email, mentee_email, language_name, rating, feedback) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [mentor_email, mentee_email, language_name, rating, feedback], (err, result) => {
    if (err) {
      console.error('Error posting mentor feedback:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // ✅ Update mentees table to set mentorf = 'yes'
    const updateQuery = `
      UPDATE mentees 
      SET menteef = 'yes' 
      WHERE mentor_email = ? 
        AND mentee_email = ? 
        AND language_name = ?
        AND status = 'ongoing'
    `;

    db.query(updateQuery, [mentor_email, mentee_email, language_name], (updateErr) => {
      if (updateErr) {
        console.error('Error updating mentorf in mentees table:', updateErr);
        return res.status(500).json({ error: 'Feedback saved but failed to update mentorf status' });
      }

      return res.status(200).json({ message: 'Feedback to mentor by mentee submitted successfully and mentorf updated' });
    });
  });
});






module.exports = router;