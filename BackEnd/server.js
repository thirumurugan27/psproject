const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const config = require("./src/config/config.js").development;
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

// ---------------- AUTH + BASIC ---------------------
app.get("/user", (req, res) => {
  db.query("SELECT * FROM userdetails", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
});

app.post("/user/login", (req, res) => {
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

//Eligible levels of student
app.get("/levels/:email", (req, res) => {
  const email = req.params.email;

  const checkSql = `
    SELECT student_email AS email FROM mentors WHERE student_email = ?
    UNION
    SELECT mentee_email AS email FROM mentees WHERE mentee_email = ? AND status = 'ongoing'
  `;

  db.query(checkSql, [email, email], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });

    if (existing.length > 0) {
      return res.status(200).json([]); // Already a mentor or mentee, no options
    }

    // Now check if pending or approved mentor request exists
    const pendingSql = `
      SELECT * FROM mentor_requests
      WHERE student_email = ?
        AND status IN ('pending', 'approved')
        AND DATEDIFF(CURDATE(), request_date) <= 6
    `;

    db.query(pendingSql, [email], (err2, pendingRequests) => {
      if (err2) return res.status(500).json({ error: "DB error" });

      if (pendingRequests.length > 0) {
        return res.status(200).json([]); // Pending or approved request exists, block sending new requests
      }

      // Now show eligible languages
      const sql = `
        SELECT sl.language_name, sl.level
        FROM student_levels sl
        WHERE sl.student_email = ?
          AND sl.level > 2
          AND sl.language_name NOT IN (
            SELECT language_name
            FROM mentor_requests
            WHERE student_email = ?
              AND status = 'rejected'
              AND DATEDIFF(CURDATE(), request_date) <= 6
          )
      `;

      db.query(sql, [email, email], (err3, results) => {
        if (err3) return res.status(500).json({ error: "DB error" });

        return res.status(200).json(results);
      });
    });
  });
});


// ---------------- MENTOR REQUEST & APPROVAL ------------------
//to show to faculty
//to approve or reject the request
app.get("/mentorrequests", (req, res) => {
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
    //"request_id": 5,
    //"student_name": "student2",
    //"student_email": "student2.al24@bitsathy.ac.in",
    //"language_name": "C",
    //"level": 4
  });
});

app.post("/send-mentor-request", (req, res) => {
  const { student_email, language_name } = req.body;

  db.query(
    "SELECT * FROM mentor_requests WHERE student_email = ? AND language_name = ?",
    [student_email, language_name],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (result.length > 0)
        return res.status(200).json({ message: "Request already sent" });

      db.query(
        "INSERT INTO mentor_requests (student_email, language_name) VALUES (?, ?)",
        [student_email, language_name],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Insert error" });
          res.json({ message: "Request submitted" });
        }
      );
    }
  );
});

//faculty can approve or reject the request
app.put("/update-request-status", (req, res) => {
  //status = 'approved' or 'rejected'
  const { request_id, status } = req.body;

  if (!request_id || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Step 1: Update the status of the request
  const updateSql = "UPDATE mentor_requests SET status = ? WHERE id = ?";
  db.query(updateSql, [status, request_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mentor request not found" });
    }

    // If rejected, just respond back
    if (status === "rejected") {
      return res.status(200).json({ message: "Mentor request rejected successfully" }); //added status(200) -G
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
        res.status(200).json({ message: "Mentor request approved and mentor added" });  //added status(200) -G
      });
    });
  });
});

app.get("/mentorrequests-details/:email", (req, res) => {
  const student_email = req.params.email; // 🔥 FIXED

  const sql = `
    SELECT 
      mr.id AS request_id,
      u.name AS student_name,
      u.email AS student_email,
      mr.language_name,
      sl.level,
      mr.status,
      DATE_FORMAT(mr.request_date, '%Y-%m-%d %H:%i:%s') AS requested_on
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
    // "request_id": 1,
    // "student_name": "Thirumurugan K",
    // "student_email": "thirumurugank.al24@bitsathy.ac.in",
    // "language_name": "C",
    // "level": 6,
    // "status": "approved",
    // "requested_on": "2025-04-24 04:57:03"
  });
});


// ---------------- STUDENT SELECT MENTOR ------------------
// Get approved mentors for a student
// This endpoint is used to fetch mentors for a student who is not already a mentor or mentee
app.get("/approved-mentors/:student_email", (req, res) => {
  const student_email = req.params.student_email;

  // Check if student is already mentor or mentee
  const checkSql = `
    SELECT student_email AS email FROM mentors WHERE student_email = ?
    UNION
    SELECT mentee_email AS email FROM mentees WHERE mentee_email = ? AND status = 'ongoing'
  `;

  db.query(checkSql, [student_email, student_email], (err0, existing) => {
    if (err0) return res.status(500).json({ error: "Check error" });

    if (existing.length > 0) {
      // Student is already a mentor or mentee
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
              //"mentor_name": "Student1",
              // "language_name": "C",
              // "mentor_level": 5,
              // "mentor_email": "student1@example.com"
        });
      }
    );
  });
});


app.post("/assign-mentee", (req, res) => {
  const { mentor_email, mentee_email, language_name } = req.body;

  if (!mentor_email || !mentee_email || !language_name)
    return res.status(200).json({ message: "All fields are required" });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 6);

  db.query(
    "INSERT INTO mentees (mentor_email, mentee_email, language_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, 'ongoing')",
    [
      mentor_email,
      mentee_email,
      language_name,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Insert mentee error" });
      res.json({ message: "Mentee assigned successfully" });
    }
  );
});

// ---------------- MENTORSHIP HISTORY ------------------
app.get("/menteeslist/:mentor_email/:language_name", (req, res) => {
  const { mentor_email, language_name } = req.params;

  const sql = `
    SELECT 
      m.mentee_email,
      u.name AS mentee_name,
      m.language_name,
      m.start_date,
      m.end_date,
      m.status
    FROM mentees m
    JOIN userdetails u ON u.email = m.mentee_email
    WHERE m.mentor_email = ? AND m.language_name = ?
  `;

  db.query(sql, [mentor_email, language_name], (err, results) => {
    if (err) {
      console.error("DB error:", err);

      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No mentees found" });
    }
    res.status(200).json(results);

    //"mentee_email": "student2.al24@bitsathy.ac.in",
    // "mentee_name": "student2",
    // "language_name": "C",
    // "start_date": "2025-04-19T18:30:00.000Z",
    // "end_date": "2025-04-25T18:30:00.000Z",
    // "status": "ongoing"
  });
});

app.get("/mentor-history/:email", (req, res) => {
  db.query(
    "SELECT * FROM mentors WHERE student_email = ?;",
    [req.params.email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(results);
      //"student_email": "thirumurugank.al24@bitsathy.ac.in",
      //"language_name": "C",
      //"start_date": "2025-04-12T18:30:00.000Z"
    }
  );
});

app.get("/mentee-history/:email", (req, res) => {
  db.query(
    "SELECT * FROM mentees WHERE mentee_email = ?",
    [req.params.email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(results);
    }
  );
});

// ---------------- SERVER START ------------------

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
