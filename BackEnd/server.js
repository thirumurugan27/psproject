require("dotenv").config();
const moment = require('moment');
const db=require("./db");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

const authRoutes=require("./Routes/auth");
const studentRoutes = require("./controllers/student");
const facultyRoutes = require("./controllers/faculty");
const mentorRoutes = require("./controllers/mentor");
const menteeRoutes = require("./controllers/mentee");

app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/mentor", mentorRoutes);
app.use("/mentee", menteeRoutes);
app.use("/student", studentRoutes);



app.listen(PORT, () =>
  console.log(`🚀server running successfully on http://localhost:${PORT}`)
);