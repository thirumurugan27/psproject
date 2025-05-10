const express = require("express");
const router = express.Router();
const db = require("../db");
const moment = require('moment');

// Student can send request to faculty for mentorship
router.post("/send-request", (req, res) => {
  const { student_email, language_name } = req.body;

  db.query(
    "SELECT * FROM mentor_requests WHERE student_email = ? AND language_name = ?",
    [student_email, language_name],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length > 0) {
        const requestStatus = result[0].status; // Assuming you have a 'status' column like 'pending', 'approved', 'rejected'

        if (requestStatus === "pending") {
          return res
            .status(200)
            .json({ message: "Previous request is pending" });
        } else if (requestStatus === "approved") {
          return res
            .status(200)
            .json({ message: "Already approved as mentor" });
        } else if (requestStatus === "rejected") {
          // If rejected, allow re-request after some time maybe?
          return res.status(200).json({
            message:
              "Previous request was rejected. Please wait before reapplying.",
          });
        } else {
          return res.status(200).json({ message: "Unknown request status" });
        }
      }

      // No previous request found -> Insert new request
      db.query(
        "INSERT INTO mentor_requests (student_email, language_name, status, request_date) VALUES (?, ?, 'pending', NOW())",
        [student_email, language_name],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Insert error" });
          res.json({ message: "Request submitted successfully" });
        }
      );
    }
  );
});


//mentor request changed by faculty
//To see the ststus of request
router.get("/request-status/:email", (req, res) => {
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
    WHERE mr.student_email = ?
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


// To see the mentee requests for a mentor
// GET /api/mentor/requests/:mentor_email
router.get("/mentees-requests/:mentor_email", (req, res) => {
  const { mentor_email } = req.params;

  const query = `
    SELECT 
      mr.student_email, 
      u.name AS student_name, 
      mr.language_name, 
      sl.level,
      DATE_FORMAT(mr.request_date, '%d-%m-%Y') AS request_date,
      mr.status
    FROM mentee_requests mr
    JOIN userdetails u ON mr.student_email = u.email
    JOIN student_levels sl 
      ON sl.student_email = mr.student_email 
     AND sl.language_name = mr.language_name
    WHERE 
      mr.mentor_email = ? 
      AND mr.status = 'pending'
      AND NOT EXISTS (
        SELECT 1 
        FROM mentor_feedback mf
        WHERE 
          mf.mentor_email = mr.mentor_email
          AND mf.mentee_email = mr.student_email
          AND mf.language_name = mr.language_name
      )
    ORDER BY mr.request_date ASC
  `;

  db.query(query, [mentor_email], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (requests.length === 0) {
      return res
        .status(404)
        .json({});
    }

    res.json({requests });
  });
});


//To accept and reject the request(Note use DELETE method to delete the request NEXT to This code)
router.post("/update-request", (req, res) => {
  const {
    student_email,
    mentor_email,
    language_name,
    status,
    rejection_reason,
  } = req.body;

  if (!student_email || !mentor_email || !language_name || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Debugging: Check the structure of the table (optional)
  db.query("DESCRIBE mentee_requests", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if pending request exists
    db.query(
      'SELECT * FROM mentee_requests WHERE student_email = ? AND mentor_email = ? AND language_name = ? AND status = "pending"',
      [student_email, mentor_email, language_name],
      (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (request.length === 0) {
          return res.status(404).json({ message: "No pending request found" });
        }

        if (status === "accepted") {
          // Step 1: Update status to 'accepted' for the selected mentor
          db.query(
            'UPDATE mentee_requests SET status = "accepted" WHERE student_email = ? AND mentor_email = ? AND language_name = ?',
            [student_email, mentor_email, language_name],
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Step 2: Get mentor's start and end dates
              db.query(
                'SELECT start_date, end_date FROM mentors WHERE student_email = ? AND language_name = ? AND status = "ongoing"',
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

                  // Step 3: Insert into mentees table
                  db.query(
                    'INSERT INTO mentees (mentor_email, mentee_email, language_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, "ongoing")',
                    [mentor_email, student_email, language_name, start_date, end_date],
                    (err) => {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }

                      // Step 4: Update all other mentee requests to status = 'delete'
                      db.query(
                        `UPDATE mentee_requests 
                         SET status = "delete" 
                         WHERE student_email = ? 
                           AND status = "pending"`,
                        [student_email],
                        (err) => {
                          if (err) {
                            return res.status(500).json({ error: err.message });
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
        
        
        
         else if (status === "rejected") {
          // Reject with reason
          db.query(
            'UPDATE mentee_requests SET status = "rejected", rejection_reason = ? WHERE student_email = ? AND mentor_email = ? AND language_name = ?',
            [
              rejection_reason || "Not specified",
              student_email,
              mentor_email,
              language_name,
            ],
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
            message: 'Invalid status value. Use "accepted" or "rejected"',
          });
        }
      }
    );
  });
});


//after accepting the request, delete the request
router.delete("/delete", (req, res) => {
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
router.get("/menteeslist/:mentor_email", (req, res) => {
  const { mentor_email } = req.params;
  const sql = `
    SELECT 
      m.mentee_email,
      u.name AS mentee_name,
      m.language_name,
      sl.level AS mentee_level,
      m.start_date,
      m.end_date,
      m.status
    FROM mentees m
    JOIN userdetails u ON u.email = m.mentee_email
    JOIN student_levels sl ON sl.student_email = m.mentee_email AND sl.language_name = m.language_name
    WHERE m.mentor_email = ?
  `;

  db.query(sql, [mentor_email], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(200).json([]); //naa tha -G
    }

    // Format start_date and end_date to dd-mm-yyyy
    const formattedResults = results.map((mentee) => ({
      ...mentee,
      start_date: formatDate(mentee.start_date),
      end_date: formatDate(mentee.end_date),
    }));

    res.status(200).json(formattedResults);

    // "mentee_email": "student10.al24@bitsathy.ac.in",
    //   "mentee_name": "student10",
    //   "language_name": "C",
    //   "mentee_level": 0,
    //   "start_date": "27-04-2025",
    //   "end_date": "03-05-2025",
    //   "status": "ongoing"
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
router.post('/slot', (req, res) => {
  const { mentor_email, mentee_email, language, start_time } = req.body;

  // Get current date and determine booking date
  let today = moment();
  let bookingDate = moment(today).add(1, 'days');

  // If tomorrow is Saturday (6) or Sunday (0), use today
  if (bookingDate.day() === 6 || bookingDate.day() === 0) {
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

  db.query(getMenteeLevelQuery, [mentee_email, language], (err, result) => {
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

    db.query(updateAttemptsQuery, [mentee_email, language], (err, result) => {
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
          language,
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
router.post('/feedback', (req, res) => {
  const { mentee_email, mentor_email, language_name, rating, feedback } = req.body;

  if (!mentee_email || !mentor_email || !language_name || !rating || !feedback ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
    INSERT INTO mentee_feedback 
    (mentee_email, mentor_email, language_name, rating, feedback) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [mentee_email, mentor_email, language_name, rating, feedback], (err, result) => {
    if (err) {
      console.error('Error posting mentee feedback:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.status(200).json({ message: 'feedback to mentee by mentor submitted successfully' });
  });
});


// To get the AVERAGE rating of a mentor
router.get('/avg-rating/:mentor_email/:language', (req, res) => {
  const mentorEmail = req.params.mentor_email;
  const language = req.params.language;

  const query = `
      SELECT 
          AVG(rating) AS avg_rating
      FROM 
          mentor_feedback
      WHERE 
          mentor_email = ? AND language = ?;
  `;

  db.query(query, [mentorEmail, language], (err, results) => {
    if (err) {
      console.error('Error fetching average rating for mentor by language:', err);
      return res.status(500).send('Internal server error');
    }

    const avgRating = results[0].avg_rating === null ? 0 : results[0].avg_rating;

    return res.send(`${avgRating}`);  // Send just the average rating as a plain number
  });
});
 


module.exports = router;
