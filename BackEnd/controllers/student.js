const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/levels/:email", (req, res) => {
  const email = req.params.email;

  const sql = `
    SELECT language_name, level
    FROM student_levels
    WHERE student_email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }

    return res.status(200).json(results);
  });
});


// Route to get attempts with levels (level1, level2, ... level7) for a given student and language
router.get('/getattempts', (req, res) => {
  let { email, language } = req.query;

  if (!email || !language) {
    return res.status(400).json({ error: 'Email and language are required as query parameters' });
  }

  // Normalize to lower case to prevent casing mismatches
  email = email.trim().toLowerCase();

  const query = `
    SELECT student_email, language_name, level,
      level1, level2, level3, level4, level5, level6, level7
    FROM student_levels
    WHERE LOWER(student_email) = ? AND LOWER(language_name) = ?
  `;

  db.query(query, [email, language], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the provided email and language' });
    }

    const levelData = results[0];

    return res.json({
      email: levelData.student_email,
      language: levelData.language_name,
      completedLevel: levelData.level,
      level1: levelData.level1,
      level2: levelData.level2,
      level3: levelData.level3,
      level4: levelData.level4,
      level5: levelData.level5,
      level6: levelData.level6,
      level7: levelData.level7
    });
  });
});



module.exports = router;