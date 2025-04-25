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

// ---------------- FETCH LANGUAGES ------------------

app.get("/languages", (req, res) => {
  db.query("SELECT * FROM languages", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
});

//Eligible levels of student
app.get("/levels/:email", (req, res) => {
  db.query(
    "SELECT * FROM student_levels WHERE student_email = ? AND level > 2",
    [req.params.email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(results);
      //returns
      //language_name = results.language_name;
      //level = results.level;
    }
  );
});

// ---------------- MENTOR REQUEST & APPROVAL ------------------

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
    return res.status(400).json({ error: "Invalid request data" });
  }

  // Step 1: Update the status of the request
  const updateSql = "UPDATE mentor_requests SET status = ? WHERE id = ?";
  db.query(updateSql, [status, request_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mentor request not found" });
    }

    // If rejected, just respond back
    if (status === "rejected") {
      return res.json({ message: "Mentor request rejected successfully" });
    }

    // Step 2: If approved, insert into mentors table
    const fetchSql =
      "SELECT student_email, language_name FROM mentor_requests WHERE id = ?";
    db.query(fetchSql, [request_id], (err2, results) => {
      if (err2 || results.length === 0)
        return res.status(400).json({ error: "Invalid request ID" });

      const { student_email, language_name } = results[0];

      const insertSql = `
        INSERT INTO mentors (student_email, language_name, start_date)
        VALUES (?, ?, CURDATE())
      `;
      db.query(insertSql, [student_email, language_name], (err3) => {
        if (err3) {
          console.error("Insert error:", err3);
          return res.status(500).json({ error: "Insert mentor error" });
        }
        res.json({ message: "Mentor request approved and mentor added" });
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
  });
});


// ---------------- STUDENT SELECT MENTOR ------------------

app.get("/approved-mentors/:student_email", (req, res) => {
  const student_email = req.params.student_email;

  db.query(
    "SELECT * FROM student_levels WHERE student_email = ?",
    [student_email],
    (err1, levels) => {
      if (err1) return res.status(500).json({ error: "Level fetch error" });

      const studentLevels = {};
      levels.forEach((row) => {
        studentLevels[row.language_name] = row.level;
      });

      db.query(
        `SELECT m.student_email AS mentor_email, u.name AS mentor_name, m.language_name, sl.level AS mentor_level
       FROM mentors m
       JOIN userdetails u ON u.email = m.student_email
       JOIN student_levels sl ON sl.student_email = m.student_email AND sl.language_name = m.language_name`,
        (err2, mentors) => {
          if (err2)
            return res.status(500).json({ error: "Mentor fetch error" });

          const filtered = mentors.filter((m) => {
            const studentLevel = studentLevels[m.language_name] || 0;
            return (
              m.mentor_email !== student_email &&
              m.mentor_level >= studentLevel + 2
            );
          });

          res.json(filtered);
          // returns
        //   "request_id": 1,
        // "student_name": "Thirumurugan K",
        // "student_email": "thirumurugank.al24@bitsathy.ac.in",
        // "language_name": "C",
        // "level": 6,
        // "status": "approved",
        // "requested_on": "2025-04-24 04:57:03"
        }
      );
    }
  );
});

app.post("/assign-mentee", (req, res) => {
  const { mentor_email, mentee_email, language_name } = req.body;

  if (!mentor_email || !mentee_email || !language_name)
    return res.status(400).json({ error: "All fields are required" });

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
      if (err) return res.status(500).json({ error: "Insert mentee error" });
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
