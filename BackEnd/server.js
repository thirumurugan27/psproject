const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser"); // Add body-parser for request body parsing

const config = require("./src/config/config.js").development;
const app = express();
const PORT = 5000;

// CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// MySQL connection
const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  dialect: config.dialect,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
    return;
  }
  console.log("Connected to MySQL database!");
});


// first get comment
app.get("/user", (req, res) => {
  const sql = "SELECT * FROM userdetails";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});


// POST route for login
app.post("/user/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  // Check if the email and password are in the DB
  const sql = "SELECT * FROM userdetails WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const user = result[0];

    if(password !== user.password) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      email: user.email,
    });
  });
});




// // Route to handle form submission
// app.post("/contact", (req, res) => {
//   const { name, email, phone, subject, message } = req.body;

//   const sql = "INSERT INTO contact (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";

//   db.query(sql, [name, email, phone, subject, message], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.status(200).json(result);
//   });
// });

// Route to fetch all contact form submissions
// app.get("/api/contact", (req, res) => {
//     const sql = "SELECT * FROM contact_form";
//     db.query(sql, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Database error" });
//       }
//       res.status(200).json(results);
//     });
//   });


//   // DELETE route for deleting contact form submission by id
// app.delete("/contact/:id", (req, res) => {
//     const { id } = req.params;  // Get the contact ID from the URL parameter
//     const sql = "DELETE FROM contact WHERE id = ?"; // Query to delete the record

//     db.query(sql, [id], (err, result) => {
//       if (err) {
//         console.error("Error deleting data:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       if (result.affectedRows === 0) {
//         // If no rows were affected, it means no record was found with the given ID
//         return res.status(404).json({ message: "Record not found" });
//       }

//       res.status(200).json({ message: "Record deleted successfully" });
//     });
//   });

//   // PUT route to update a contact form submission by id
// app.put("/contact/:id", (req, res) => {
//     const { id } = req.params; // Get the contact ID from the URL parameter
//     const { name, email, phone, subject, message } = req.body; // Get updated data from the request body

//     const sql = `
//       UPDATE contact
//       SET name = ?, email = ?, phone = ?, subject = ?, message = ?
//       WHERE id = ?
//     `;

//     db.query(sql, [name, email, phone, subject, message, id], (err, result) => {
//       if (err) {
//         console.error("Error updating data:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       if (result.affectedRows === 0) {
//         // If no rows were affected, it means no record was found with the given ID
//         return res.status(404).json({ message: "Record not found" });
//       }

//       res.status(200).json({ message: "Record updated successfully" });
//     });
//   });

// Start the server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
