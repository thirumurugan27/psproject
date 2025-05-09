require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host:
    process.env.HOST ||
    "byloav4iu7gfcn9ewblz - mysql.services.clever - cloud.com",
  user: process.env.USER || "u1ohlprjubhmulje",
  password: process.env.PASSWORD || "UyMiI2hxsGLrSKbphNcf",
  database: process.env.NAME || "byloav4iu7gfcn9ewblz",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit app if DB doesn't connect
  }
  console.log("✅ Connected to MySQL!");
});

module.exports = db;