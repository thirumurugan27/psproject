const express = require("express");
const router = express.Router();
const db = require("../db");


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
          return res
            .status(200)
            .json({
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
        WHERE mr.mentor_email = ? AND mr.status = 'pending'
        ORDER BY mr.request_date ASC
    `;

  db.query(query, [mentor_email], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending mentee requests found" });
    }

    res.json({ pending_requests: requests });
    // Response structure will look like:
    // {
    //   "pending_requests": [
    //     {
    //       "student_email": "student1.al24@bitsathy.ac.in",
    //       "student_name": "student1",
    //       "language_name": "Java",
    //       "level": 0,
    //       "request_date": "09-05-2025",
    //       "status": "pending"
    //     }
    //   ]
    // }
  });
});


//To accept and reject the request
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
          // Check mentor's current mentees in that language
          db.query(
            'SELECT COUNT(*) AS count FROM mentees WHERE mentor_email = ? AND language_name = ? AND status = "ongoing"',
            [mentor_email, language_name],
            (err, countRes) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              if (countRes[0].count >= 10) {
                return res.status(400).json({
                  message: "Mentor already has 10 mentees in this language",
                });
              }

              // Accept the request and update status
              db.query(
                'UPDATE mentee_requests SET status = "accepted" WHERE student_email = ? AND mentor_email = ? AND language_name = ?',
                [student_email, mentor_email, language_name],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  // ✅ Fetch mentor's mentorship dates
                  db.query(
                    'SELECT start_date, end_date FROM mentors WHERE student_email = ? AND language_name = ? AND status = "ongoing"',
                    [mentor_email, language_name],
                    (err, mentorRows) => {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }

                      if (mentorRows.length === 0) {
                        return res
                          .status(404)
                          .json({ message: "Mentor record not found" });
                      }

                      const { start_date, end_date } = mentorRows[0];

                      // ✅ Insert mentee record with mentor's mentorship dates
                      db.query(
                        'INSERT INTO mentees (mentor_email, mentee_email, language_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, "ongoing")',
                        [
                          mentor_email,
                          student_email,
                          language_name,
                          start_date,
                          end_date,
                        ],
                        (err) => {
                          if (err) {
                            return res.status(500).json({ error: err.message });
                          }

                          return res.json({
                            message:
                              "Mentee request accepted and added to mentees list (dates matched with mentor)",
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        } else if (status === "rejected") {
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




module.exports = router;