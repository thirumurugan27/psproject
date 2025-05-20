const express = require("express");
const router = express.Router();
const db = require("../db");
const moment = require('moment');
const verifyToken = require("../middlewares/verifyToken");

// Student can send request to faculty for mentorship
router.post("/send-request",verifyToken, (req, res) => {
  const { student_email, language_name } = req.body;

  const query = `
    SELECT * FROM mentor_requests 
    WHERE student_email = ? 
    AND language_name = ? 
    AND status IN ('pending', 'approved')
  `;

  db.query(query, [student_email, language_name], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length > 0) {
      const requestStatus = result[0].status;

      if (requestStatus === "pending") {
        return res.status(200).json({ message: "Previous request is pending" });
      } else if (requestStatus === "approved") {
        return res.status(200).json({ message: "Already approved as mentor" });
      }
    }

    // No pending or approved request → allow new request
    db.query(
      "INSERT INTO mentor_requests (student_email, language_name, status, request_date) VALUES (?, ?, 'pending', NOW())",
      [student_email, language_name],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Insert error" });
        res.json({ message: "Request submitted successfully" });
      }
    );
  });
});


//mentor request changed by faculty
//To see the ststus of request
router.get("/request-status/:email",verifyToken, (req, res) => {
  const student_email = req.params.email; // 🔥 FIXED

  const sql = `
    SELECT 
      mr.id AS request_id,
      u.name AS student_name,
      u.email AS student_email,
      mr.language_name,
      sl.level,
      mr.status,
      DATE_FORMAT(mr.request_date, '%d-%m-%Y') AS requested_on
    FROM mentor_requests mr
    JOIN userdetails u ON u.email = mr.student_email
    JOIN student_levels sl 
      ON sl.student_email = mr.student_email 
      AND sl.language_name = mr.language_name
    WHERE mr.student_email = ? AND DATEDIFF(CURDATE(), request_date) <= 6
    ORDER BY mr.request_date DESC
  `;

  db.query(sql, [student_email], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
    // returns
    // "request_id": 26,
    //  "student_name": "newstudent1",
    // "student_email": "newstudent1@bitsathy.ac.in",
    //  "language_name": "C++",
    //  "level": 3,
    //  "status": "rejected",
    //  "requested_on": "27-04-2025
  });
});

//put to change views to yes after mentor jejection
router.put('/view/:id',verifyToken, (req, res) => {
  const requestId = req.params.id;

  const sql = `UPDATE mentor_requests SET view = 'yes' WHERE id = ?`;

  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error('Error updating view:', err);
      return res.status(500).json({ error: 'Database error while updating view.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mentor request not found.' });
    }

    res.json({ message: `'view' set to 'yes' for request ID ${requestId}.` });
  });
});


// To see the mentee requests for a mentor
// GET /api/mentor/requests/:mentor_email
router.get("/mentees-requests/:mentor_email", verifyToken, (req, res) => {
  const { mentor_email } = req.params;

  const query = `
    SELECT 
      mr.student_email, 
      mr.id AS request_id,
      u.name AS student_name, 
      mr.language_name, 
      sl.level,
      DATE_FORMAT(mr.request_date, '%d-%m-%Y') AS request_date,
      mr.status,
      fb.rating AS latest_rating,
      fb.feedback AS latest_feedback,
      DATE_FORMAT(fb.created_at, '%d-%m-%Y') AS feedback_date,
      fb.mentor_name,
      fb.mentor_email
    FROM mentee_requests mr
    JOIN userdetails u ON mr.student_email = u.email
    JOIN student_levels sl 
      ON sl.student_email = mr.student_email 
     AND sl.language_name = mr.language_name
    LEFT JOIN (
      SELECT f1.*, ud.name AS mentor_name
      FROM mentee_feedback f1
      JOIN (
        SELECT mentee_email, language_name, MAX(created_at) AS latest
        FROM mentee_feedback
        GROUP BY mentee_email, language_name
      ) f2 ON f1.mentee_email = f2.mentee_email 
           AND f1.language_name = f2.language_name 
           AND f1.created_at = f2.latest
      JOIN userdetails ud ON f1.mentor_email = ud.email
      WHERE f1.mentor_email = ?
    ) fb ON fb.mentee_email = mr.student_email 
         AND fb.language_name = mr.language_name
    WHERE 
      mr.mentor_email = ? 
      AND mr.status = 'pending';
  `;

  db.query(query, [mentor_email, mentor_email], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ requests });
  });
});


//To accept and reject the request(Note use DELETE method to delete the request NEXT to This code)
router.post("/update-request", verifyToken, (req, res) => {
  const { id, status, rejection_reason } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Step 1: Check if the request exists and is pending
  db.query(
    'SELECT * FROM mentee_requests WHERE id = ? AND status = "pending"',
    [id],
    (err, requestResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (requestResult.length === 0) {
        return res
          .status(404)
          .json({ message: "No pending request found with that ID" });
      }

      const request = requestResult[0];
      const { student_email, mentor_email, language_name } = request;

      if (status === "accepted") {
        // Step 2: Check if there's already an ongoing mentorship between them
        db.query(
          `SELECT * FROM mentees
           WHERE mentor_email = ? AND mentee_email = ? AND language_name = ? AND status = 'ongoing'`,
          [mentor_email, student_email, language_name],
          (err, existingOngoing) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            if (existingOngoing.length > 0) {
              return res.status(400).json({
                message:
                  "There is already an ongoing mentorship between this mentor and mentee for the same language.",
              });
            }

            // Step 3: Accept the request
            db.query(
              'UPDATE mentee_requests SET status = "accepted" WHERE id = ?',
              [id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                // Step 4: Get mentor's mentorship dates
                db.query(
                  `SELECT start_date, end_date FROM mentors
                   WHERE student_email = ? AND language_name = ? AND status = "ongoing"`,
                  [mentor_email, language_name],
                  (err, dateResult) => {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }

                    if (dateResult.length === 0) {
                      return res.status(400).json({
                        message: "Mentor's mentorship dates not found.",
                      });
                    }

                    const { start_date, end_date } = dateResult[0];

                    // Step 5: Insert new mentorship
                    db.query(
                      `INSERT INTO mentees
                       (mentor_email, mentee_email, language_name, start_date, end_date, status)
                       VALUES (?, ?, ?, ?, ?, "ongoing")`,
                      [
                        mentor_email,
                        student_email,
                        language_name,
                        start_date,
                        end_date,
                      ],
                      (err) => {
                        if (err) {
                          return res
                            .status(500)
                            .json({ error: err.message });
                        }

                        // Step 6: Delete other pending requests
                        db.query(
                          `UPDATE mentee_requests
                           SET status = "delete"
                           WHERE student_email = ? AND status = "pending" AND id != ?`,
                          [student_email, id],
                          (err) => {
                            if (err) {
                              return res
                                .status(500)
                                .json({ error: err.message });
                            }

                            return res.json({
                              message:
                                "Mentee request accepted. Mentee added and other mentor requests marked as deleted.",
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      } else if (status === "rejected") {
        // Reject the request
        db.query(
          'UPDATE mentee_requests SET status = "rejected", rejection_reason = ? WHERE id = ?',
          [rejection_reason || "Not specified", id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            return res.json({
              message: "Mentee request rejected successfully",
            });
          }
        );
      } else {
        return res.status(400).json({
          message: 'Invalid status value. Use "accepted" or "rejected".',
        });
      }
    }
  );
});


//after accepting the request, delete the request
router.delete("/delete", verifyToken, (req, res) => {
  const query = `DELETE FROM mentee_requests WHERE status = 'delete'`;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete entries", details: err.message });
    }

    return res.json({
      message: `${result.affectedRows} request(s) with status 'delete' removed successfully.`,
    });
  });
});


//to see the all mentees
router.get("/menteeslist/:mentor_email", verifyToken, (req, res) => {
  const { mentor_email } = req.params;

  const sql = `
    SELECT 
      m.mentee_email,
      u.name AS mentee_name,
      m.language_name,
      sl.level AS mentee_current_level,
      s.level AS slot_booked_level,
      s.slot_venue AS venue,
      DATE_FORMAT(s.date, '%d-%m-%Y') as slot_date,
      s.start_time,
      s.end_time,
      m.start_date,
      m.end_date,
      m.status AS mentorship_status,
      m.mentorf, -- 🆕 added here
      s.level_cleared,
      s.id as slot_id,
      CASE 
        WHEN s.id IS NOT NULL AND s.status = 'ongoing' THEN 'yes'
        ELSE 'no'
      END AS slot_booked
    FROM mentees m
    JOIN userdetails u ON u.email = m.mentee_email
    JOIN student_levels sl ON sl.student_email = m.mentee_email AND sl.language_name = m.language_name
    LEFT JOIN slot s 
      ON s.mentor_email = m.mentor_email 
      AND s.mentee_email = m.mentee_email 
      AND s.language = m.language_name 
      AND s.status = 'ongoing'
    WHERE m.mentor_email = ? AND m.status = 'ongoing'
  `;

  db.query(sql, [mentor_email], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formattedResults = results.map((mentee) => ({
      ...mentee,
      start_date: formatDate(mentee.start_date),
      end_date: formatDate(mentee.end_date),
    }));

    res.status(200).json(formattedResults);
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


//💻🧑‍💻SLOT book to menteee
router.post('/slot', verifyToken, (req, res) => {
  const { mentor_email, mentee_email, language_name, start_time } = req.body;

  // Get current date and determine booking date
  let today = moment();
  let bookingDate = moment(today).add(1, 'days');

  // If tomorrow is Saturday (6) or Sunday (0), use today
  if (bookingDate.day() === 0) {
    bookingDate = today;
  }

  // Format date as dd-mm-yyyy for display (store in db as YYYY-MM-DD)
  const displayDate = bookingDate.format('DD-MM-YYYY');
  const sqlDate = bookingDate.format('YYYY-MM-DD');

  // Calculate end_time = start_time + 1hr
  const end_time = moment(start_time, 'HH:mm:ss').add(1, 'hours').format('HH:mm:ss');

  // Fetch current level of mentee
  const getMenteeLevelQuery = `
      SELECT level FROM student_levels WHERE student_email = ? AND language_name = ?
  `;

  db.query(getMenteeLevelQuery, [mentee_email, language_name], (err, result) => {
    if (err) {
      console.error("Error fetching mentee level:", err);
      return res.status(500).json({ error: 'Database fetch failed' });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: 'Mentee level not found for the given language' });
    }

    // Get current level
    const currentLevel = result[0].level;

    // Determine the correct level attempt column (level1, level2, etc.)
    const levelColumn = `level${currentLevel+1}`;

    // Update attempt count for the corresponding level column (level1, level2, etc.)
    const updateAttemptsQuery = `
          UPDATE student_levels
          SET ${levelColumn} = ${levelColumn} + 1
          WHERE student_email = ? AND language_name = ?
      `;

    db.query(updateAttemptsQuery, [mentee_email, language_name], (err, result) => {
      if (err) {
        console.error("Error updating attempts count:", err);
        return res.status(500).json({ error: 'Failed to update attempts count' });
      }

      // Increment level (level + 1) and insert the slot into the database
      const newLevel = currentLevel + 1;

      // Fetch a random venue from the slot_venue table
      const getRandomVenueQuery = `SELECT venue FROM slot_venue ORDER BY RAND() LIMIT 1`;

      db.query(getRandomVenueQuery, (err, venueResult) => {
        if (err) {
          console.error("Error fetching random venue:", err);
          return res.status(500).json({ error: 'Failed to fetch random venue' });
        }

        // If no venue is found, return error
        if (venueResult.length === 0) {
          return res.status(400).json({ error: 'No venues available' });
        }

        const randomVenue = venueResult[0].venue;

        // Insert the slot with the new level (level + 1) and the random venue
        const insertSlotQuery = `
              INSERT INTO slot (
                  mentor_email, mentee_email, language, level,
                  slot_venue, date, start_time, end_time
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

        // Insert the slot with the new level and random venue
        db.query(insertSlotQuery, [
          mentor_email,
          mentee_email,
          language_name,
          newLevel,
          randomVenue,  // Use the randomly selected venue
          sqlDate,
          start_time,
          end_time
        ], (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: 'Database insert failed' });
          }

          res.json({
            message: 'Slot booked successfully',
            booking_date: displayDate,
            start_time,
            end_time,
            level: newLevel,
            venue: randomVenue  // Include venue in the response
          });
        });
      });
    });
  });
});


//⭐⭐⭐⭐⭐ Feedback and Rating to mentee
router.post('/feedback', verifyToken, (req, res) => {
  const { mentee_email, mentor_email, language_name, rating, feedback } = req.body;

  if (!mentee_email || !mentor_email || !language_name || !rating || !feedback) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const insertQuery = `
    INSERT INTO mentee_feedback 
    (mentee_email, mentor_email, language_name, rating, feedback) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [mentee_email, mentor_email, language_name, rating, feedback], (err, result) => {
    if (err) {
      console.error('Error posting mentee feedback:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // ✅ Update mentees table to set menteef = 'yes'
    const updateQuery = `
      UPDATE mentees 
      SET mentorf = 'yes' 
      WHERE mentee_email = ? 
        AND mentor_email = ? 
        AND language_name = ?
        AND status = 'ongoing'
    `;

    db.query(updateQuery, [mentee_email, mentor_email, language_name], (updateErr) => {
      if (updateErr) {
        console.error('Error updating menteef in mentees table:', updateErr);
        return res.status(500).json({ error: 'Feedback saved but failed to update menteef status' });
      }

      return res.status(200).json({ message: 'Feedback to mentee by mentor submitted successfully and menteef updated' });
    });
  });
});


// To get the feedback of a mentee given by previous mentor
router.get('/feedback/:mentee_email/:language', verifyToken, (req, res) => {
  const menteeEmail = req.params.mentee_email;
  const language = req.params.language;

  const query = `
    SELECT 
      u.name AS mentor_name, 
      u.email AS mentor_email, 
      f.rating, 
      f.feedback,
      f.created_at
    FROM 
      mentee_feedback f
    JOIN 
      userdetails u ON f.mentor_email = u.email
    WHERE 
      f.mentee_email = ? AND f.language_name = ?
    ORDER BY 
      f.created_at DESC
    LIMIT 1;
  `;

  db.query(query, [menteeEmail, language], (err, results) => {
    if (err) {
      console.error('Error fetching latest feedback for mentee by language:', err);
      return res.status(500).send({ error: 'Database error', details: err.message });
    }

    return res.json(results);
  });
});


// to get level cleared by mentee
router.get('/mentorshiprp/:mentorEmail', verifyToken, (req, res) => {
  const mentorEmail = req.params.mentorEmail;

  const query = `
    SELECT 
      rp.mentee_email, 
      ud.name AS mentee_name, 
      rp.language_name, 
      rp.level , 
      rp.mentorship_points as level_rp
    FROM reward_points rp
    JOIN userdetails ud ON rp.mentee_email = ud.email
    WHERE rp.mentor_email = ? AND rp.student_email != rp.mentee_email
    ORDER BY rp.last_updated DESC
  `;

  db.query(query, [mentorEmail], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({
      mentees: results
    });
  });
});


router.get("/slots/:email", verifyToken, (req, res) => {
  const mentorEmail = req.params.email;

  const sql = `
    SELECT 
      id,
      mentee_email,
      language,
      level,
      slot_venue,
      DATE_FORMAT(date, '%d-%m-%Y') AS date,
      start_time,
      end_time,
      status,
      level_cleared
    FROM slot
    WHERE mentor_email = ? AND status = 'ongoing'
    ORDER BY date, start_time
  `;

  db.query(sql, [mentorEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
