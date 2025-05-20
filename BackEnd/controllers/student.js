const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/verifyToken");

//get student levels and mentor/mentee details
router.get("/levels/:email",verifyToken, (req, res) => {
  const email = req.params.email;

  const result = {
    mentor: [],
    mentee: [],
    mentorrequest: [],
    menteerequest: [],
    levels: []
  };

  const sqlAllLevels = `  
    SELECT language_name, level 
    FROM student_levels 
    WHERE student_email = ?
      AND language_name NOT IN (
        SELECT language_name 
        FROM mentor_requests 
        WHERE student_email = ? 
          AND status = 'rejected'
          AND DATEDIFF(CURDATE(), request_date) <= 6
      )
      AND language_name NOT IN (
        SELECT language_name 
        FROM mentee_requests 
        WHERE student_email = ? 
          AND status IN ('pending', 'rejected')
          AND DATEDIFF(CURDATE(), request_date) < 6
      )
    ORDER BY language_name
  `;

  const sqlMentor = `
    SELECT 
      m.language_name,
      sl.level,
      m.status,
      DATE_FORMAT(m.start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(DATE_ADD(m.start_date, INTERVAL 6 DAY), '%d-%m-%Y') AS end_date
    FROM mentors m
    JOIN student_levels sl 
      ON m.student_email = sl.student_email AND m.language_name = sl.language_name
    WHERE m.student_email = ? AND m.status = 'ongoing'
  `;

  const sqlMentee = `
    SELECT 
      me.language_name,
      sl.level AS mentee_level,
      msl.level AS mentor_level,
      me.mentor_email,
      ud.name AS mentor_name,
      DATE_FORMAT(me.start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(me.end_date,'%d-%m-%Y') AS end_date,
      me.status
    FROM mentees AS me
    JOIN student_levels AS sl 
      ON sl.student_email = me.mentee_email AND sl.language_name = me.language_name
    JOIN student_levels AS msl 
      ON msl.student_email = me.mentor_email AND msl.language_name = me.language_name
    JOIN userdetails AS ud 
      ON ud.email = me.mentor_email
    WHERE me.status = 'ongoing' AND me.mentee_email = ?
  `;

  const sqlMentorRequest = `
    SELECT 
      mr.id,
      mr.language_name, 
      mr.rejection_reason,
      sl.level,
      mr.status, 
      DATE_FORMAT(mr.request_date, '%d-%m-%Y') AS request_date,
      mr.view
    FROM mentor_requests mr
    JOIN student_levels sl 
      ON mr.student_email = sl.student_email 
      AND mr.language_name = sl.language_name
    WHERE mr.student_email = ? 
      AND DATEDIFF(CURDATE(), mr.request_date) <= 6 
      AND mr.status IN ('pending', 'rejected')
      AND mr.view = 'no'
  `;

  const sqlMenteeRequest = `
    SELECT 
      mr.id,
      mr.language_name,
      sl.level AS mentee_level,
      msl.level AS mentor_level,
      DATE_FORMAT(mr.request_date, '%d-%m-%Y') AS request_date,
      mr.status,
      mr.mentor_email,
      ud.name AS mentor_name
    FROM mentee_requests mr
    JOIN student_levels sl 
      ON mr.student_email = sl.student_email AND mr.language_name = sl.language_name
    JOIN student_levels msl 
      ON mr.mentor_email = msl.student_email AND mr.language_name = msl.language_name
    JOIN userdetails ud 
      ON mr.mentor_email = ud.email
    WHERE mr.student_email = ? 
      AND mr.status= 'pending'
      AND DATEDIFF(CURDATE(), mr.request_date) < 6
  `;

  // Step 1: Get all student levels (pass all 3 placeholders)
  db.query(sqlAllLevels, [email, email, email], (err, levels) => {
    if (err) return res.status(500).json({ error: "Levels query error", details: err.message });

    const filteredLevels = [];

    const checkMentorsForLanguage = (index) => {
      if (index >= levels.length) {
        result.levels = filteredLevels;

        // Step 2: Continue other queries
        return db.query(sqlMentor, [email], (err, mentors) => {
          if (err) return res.status(500).json({ error: "Mentor query error", details: err.message });
          result.mentor = mentors.map(m => ({ ...m, role: "mentor" }));

          db.query(sqlMentee, [email], (err, mentees) => {
            if (err) return res.status(500).json({ error: "Mentee query error", details: err.message });
            result.mentee = mentees.map(m => ({ ...m, role: "mentee" }));

            db.query(sqlMentorRequest, [email], (err, mentorRequests) => {
              if (err) return res.status(500).json({ error: "Mentor request query error", details: err.message });
              result.mentorrequest = mentorRequests.map(m => ({ ...m, role: "mentor" }));

              db.query(sqlMenteeRequest, [email], (err, menteeRequests) => {
                if (err) return res.status(500).json({ error: "Mentee request query error", details: err.message });
                result.menteerequest = menteeRequests.map(m => ({ ...m, role: "mentee" }));

                return res.status(200).json(result);
              });
            });
          });
        });
      }

      const { language_name, level } = levels[index];

      // Step 2: Get all mentors for this language
      const mentorQuery = `
        SELECT DISTINCT m.student_email
        FROM mentors m
        JOIN student_levels sl ON sl.student_email = m.student_email AND sl.language_name = m.language_name
        WHERE m.status = 'ongoing' AND m.language_name = ? AND sl.level >= 2
      `;

      db.query(mentorQuery, [language_name], (err, mentors) => {
        if (err) return res.status(500).json({ error: "Mentor fetch error", details: err.message });

        if (mentors.length === 0) {
          // No mentors → include the language
          filteredLevels.push({ language_name, level });
          return checkMentorsForLanguage(index + 1);
        }

        const mentorEmails = mentors.map(m => m.student_email);

        // Step 3: Get rejected mentor emails by the student
        const rejectionQuery = `
          SELECT mentor_email FROM mentee_requests
          WHERE student_email = ? AND language_name = ? AND status = 'rejected'
            AND DATEDIFF(CURDATE(), request_date) < 6
        `;

        db.query(rejectionQuery, [email, language_name], (err, rejected) => {
          if (err) return res.status(500).json({ error: "Rejection fetch error", details: err.message });

          const rejectedMentors = rejected.map(r => r.mentor_email);
          const allRejected = mentorEmails.every(m => rejectedMentors.includes(m));

          if (!allRejected) {
            filteredLevels.push({ language_name, level });
          }

          checkMentorsForLanguage(index + 1);
        });
      });
    };

    checkMentorsForLanguage(0); // Recursive async check
  });
});


//return
// {
//    "mentor": [ {
//            "language_name": "Java",
//             "level": 6,
//              "status": "ongoing",
//               "start_date": "04-05-2025",
//              "end_date": "10-05-2025"
//         }],


//        "mentee": [
//          {
//             "language_name": "Java",
//            "mentee_level": 1,
//            "mentor_level": 6,
//            "mentor_email": "gowthamj.al24@bitsathy.ac.in",
//            "mentor_name": "Gowtham J",
//            "start_date": "04-05-2025",
//            "end_date": "10-05-2025",
//            "status": "ongoing"
//        }
//      ],


//         
//    "mentorrequest": [
//      {
//        "id": 60,
//     "language_name": "Java",
//     "level": 6,
//     "status": "pending",
//     "request_date": "10-05-2025"
//      }
//      ],

// "menteerequest": [
//   {
//     "id": 60,
//     "language_name": "Java",
//     "mentee_level": 1,
//     "request_date": "09-05-2025",
//     "status": "pending",
//     "mentor_email": "gowthamj.al24@bitsathy.ac.in",
//     "mentor_name": "Gowtham J"
//   }
// ],

//           "levels": [
//             {
//               "language_name": "C",
//               "level": 2
//             },
//             {
//               "language_name": "C++",
//               "level": 2
//             },
//             {
//               "language_name": "Data Structure",
//               "level": 0
//             },
//             {
//               "language_name": "Java",
//               "level": 6
//             },
//             {
//               "language_name": "Machine Learning",
//               "level": 0
//             },
//             {
//               "language_name": "Networking",
//               "level": 0
//             },
//             {
//               "language_name": "Python",
//               "level": 6
//             },
//             {
//               "language_name": "UI/UX",
//               "level": 0
//             }
//           ]
// }

// Route to get attempts with levels (level1, level2, ... level7) for a given student and language


router.get('/getattempts', verifyToken, (req, res) => {
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
    //return format
    //   {
    //     "email": "student1.al24@bitsathy.ac.in",
    //      "language": "C",
    //      "completedLevel": 3,
    //      "level1": 2,
    //       "level2": 5,
    //       "level3": 3,
    //       "level4": 5,
    //        "level5": 0,
    //        "level6": 0,
    //        "level7": 0
    // }
  });
});


// 🪙🎖️🏆To GET RP 
router.get('/rp/:email', verifyToken, (req, res) => {
  const studentEmail = req.params.email;

  if (!studentEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = `
      SELECT 
          SUM(normal_points) AS total_normal_points,
          SUM(mentorship_points) AS total_mentorship_points
      FROM reward_points
      WHERE student_email = ?
  `;

  db.query(query, [studentEmail], (err, results) => {
    if (err) {
      console.error('Error fetching reward points:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const normalRP = results[0].total_normal_points || 0;
    const mentorshipRP = results[0].total_mentorship_points || 0;

    return res.json({
      student_email: studentEmail,
      normal_rp: normalRP,
      mentorship_rp: mentorshipRP
    });
    //return
    // {
    //   "student_email": "thirumurugank.al24@bitsathy.ac.in",
    //   "normal_rp": "10800",
    //   "mentorship_rp": "0"
    // }
  });
});


//🎯📈 level cleared status
router.put('/slot-level-update', (req, res) => {
  const { slot_id, level_cleared } = req.body;

  if (!slot_id || !['yes', 'no'].includes(level_cleared)) {
    return res.status(400).json({ error: 'slot_id and valid level_cleared ("yes" or "no") are required.' });
  }

  const updateSlotQuery = `UPDATE slot SET level_cleared = ? WHERE id = ?`;

  db.query(updateSlotQuery, [level_cleared, slot_id], (err, result) => {
    if (err) {
      console.error('Error updating slot:', err);
      return res.status(500).json({ error: 'Failed to update slot.' });
    }

    if (level_cleared === 'no') {
      return res.json({ message: 'Level not cleared. Slot updated.' });
    }

    // If level_cleared is "yes", continue to reward and level updates
    const fetchSlotQuery = `
      SELECT s.*, u.name as mentee_name
      FROM slot s
      JOIN userdetails u ON s.mentee_email = u.email
      WHERE s.id = ?
    `;

    db.query(fetchSlotQuery, [slot_id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Error fetching slot details:', err);
        return res.status(500).json({ error: 'Failed to fetch slot details.' });
      }

      const slot = results[0];
      const { mentor_email, mentee_email, language, level } = slot;

      const levelRPColumn = `l${level}rp`;
      const getRPQuery = `SELECT \`${levelRPColumn}\` AS level_rp FROM languages WHERE language_name = ?`;

      db.query(getRPQuery, [language], (err, rpResults) => {
        if (err || rpResults.length === 0) {
          console.error('Error fetching reward points:', err);
          return res.status(500).json({ error: 'Failed to fetch reward points.' });
        }

        const levelRP = rpResults[0].level_rp;
        const mentorRP = Math.floor(levelRP * 0.10);
        const menteeRP = levelRP - mentorRP;

        // Update mentee level
        const updateMenteeLevelQuery = `
          UPDATE student_levels
          SET level = ?
          WHERE student_email = ? AND language_name = ?
        `;

        db.query(updateMenteeLevelQuery, [level, mentee_email, language], (err) => {
          if (err) {
            console.error('Error updating mentee level:', err);
            return res.status(500).json({ error: 'Failed to update mentee level.' });
          }

          // Insert into reward_points table for mentor
          const insertMentorRPQuery = `
            INSERT INTO reward_points (student_email, mentor_email, mentee_email, language_name, level, mentorship_points)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(insertMentorRPQuery, [mentor_email, mentor_email, mentee_email, language, level, mentorRP], (err) => {
            if (err) {
              console.error('Error inserting mentor RP:', err);
              return res.status(500).json({ error: 'Failed to insert mentor reward points.' });
            }

            // Insert into reward_points table for mentee
            const insertMenteeRPQuery = `
              INSERT INTO reward_points (student_email, mentor_email, mentee_email, language_name, level, normal_points)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(insertMenteeRPQuery, [mentee_email, mentor_email, mentee_email, language, level, menteeRP], (err) => {
              if (err) {
                console.error('Error inserting mentee RP:', err);
                return res.status(500).json({ error: 'Failed to insert mentee reward points.' });
              }

              return res.json({
                message: 'Level cleared. Slot, levels, and reward points updated.',
                mentor_reward: mentorRP,
                mentee_reward: menteeRP
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;