require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host:
    process.env.HOST,
    user: process.env.USER ,
    password: process.env.PASSWORD,
    database: process.env.NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//set indian time zone
db.query("SET time_zone = '+05:30'", (err) => {
  if (err) {
    console.error("❌ Failed to set time zone:", err);
  } else {
    console.log("✅ Time zone set to IST (Asia/Kolkata)");
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit app if DB doesn't connect
  }
  console.log("✅ Connected to MySQL!");
});


// to get current time
db.query("SELECT NOW()", (err, results) => {
  if (err) {
    console.error("❌ Error fetching time:", err);
    return;
  }

  // Log the result to console
  console.log("✅ Current Time:", results[0]['NOW()']);
});

module.exports = db;