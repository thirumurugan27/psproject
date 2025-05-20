const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.get("/requests",verifyToken,(req, res) => {
  const sql = `
    SELECT 
      mr.id AS request_id,
      u.name AS student_name,
      u.email AS student_email,
      mr.language_name,
      sl.level
    FROM mentor_requests mr
    JOIN userdetails u ON u.email = mr.student_email
    JOIN student_levels sl 
      ON sl.student_email = mr.student_email 
      AND sl.language_name = mr.language_name
    WHERE mr.status = 'pending'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  // only pending requests are fetched
  //   [
  //     {
  //       "request_id": 60,
  //       "student_name": "Thirumurugan K",
  //       "student_email": "thirumurugank.al24@bitsathy.ac.in",
  //       "language_name": "C",
  //       "level": 6
  //     }
  // ]
  });
});


//faculty can approve or reject the request
router.put("/update-status",verifyToken, (req, res) => {
  const { request_id, status, rejection_reason } = req.body;

  if (!request_id || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (
    status === "rejected" &&
    (!rejection_reason || rejection_reason.trim() === "")
  ) {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  // Step 1: Update the request with status (and rejection_reason if applicable)
  const updateSql = `
    UPDATE mentor_requests 
    SET status = ?, rejection_reason = ${status === "rejected" ? "?" : "NULL"} 
    WHERE id = ?
  `;

  const updateParams =
    status === "rejected"
      ? [status, rejection_reason, request_id]
      : [status, request_id];

  db.query(updateSql, updateParams, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mentor request not found" });
    }

    if (status === "rejected") {
      return res
        .status(200)
        .json({ message: "Request rejected with reason stored" });
    }

    // Step 2: If approved, insert into mentors table
    const fetchSql =
      "SELECT student_email, language_name FROM mentor_requests WHERE id = ?";
    db.query(fetchSql, [request_id], (err2, results) => {
      if (err2 || results.length === 0)
        return res.status(400).json({ message: "Invalid request ID" });

      const { student_email, language_name } = results[0];

      const insertSql = `
        INSERT INTO mentors (student_email, language_name, start_date)
        VALUES (?, ?, CURDATE())
      `;
      db.query(insertSql, [student_email, language_name], (err3) => {
        if (err3) {
          console.error("Insert error:", err3);
          return res.status(500).json({ message: "Insert mentor error" });
        }
        res
          .status(200)
          .json({ message: "Mentor request approved and mentor added" });
      });
    });
  });
});


//to see mentor feedback and rating given by mentee(individual)
router.get('/mentor-feedback/:mentor_email/:language',verifyToken, (req, res) => {
  const mentorEmail = req.params.mentor_email;
  const language = req.params.language;

  const query = `
      SELECT 
          u.name AS name, 
          u.email AS email, 
          f.rating, 
          f.feedback
      FROM 
          mentor_feedback f  -- Corrected table name here
      JOIN 
          userdetails u ON f.mentee_email = u.email
      WHERE 
          f.mentor_email = ? AND f.language_name = ?;
  `;

  db.query(query, [mentorEmail, language], (err, results) => {
    if (err) {
      console.error('Error fetching feedback for mentor by language:', err);
      return res.status(500).send('Internal server error');
    }

    // If no feedback found, return empty array
    if (results.length === 0) {
      return res.json([]);
    }

    // Return feedback and ratings as an array of objects
    return res.json(results);
      //return structured data
      //   [
      //     {
      //       "name": "student1",
      //       "email": "student1.al24@bitsathy.ac.in",
      //       "rating": 4,
      //       "feedback": "Hey Very Good Man"
      //     }
      // ]
  });
});



module.exports = router;