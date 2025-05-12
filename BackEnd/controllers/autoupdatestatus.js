const express = require("express");
const router = express.Router();
const db = require("../db");


// Function to expire old mentor requests
function expireOldMentorRequests() {
    const query = `
    UPDATE mentor_requests
    SET status = 'expired'
    WHERE status IN('pending','approved') AND DATEDIFF(CURDATE(), request_date) >= 6  
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error expiring mentor requests:', err.message);
        } else {
            console.log(`✅ ${results.affectedRows} pending mentor requests expired.`);
        }
    });
}


// Function to expire old mentee requests
function expireOldMenteeRequests() {
    const query = `
    UPDATE mentee_requests
    SET status = 'expired'
    WHERE status = 'pending' AND DATEDIFF(CURDATE(), request_date) >= 6  
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error expiring mentee requests:', err.message);
        } else {
            console.log(`✅ ${results.affectedRows} pending mentee requests expired.`);
        }
    });
}



function expireOldMentors() {
    const query = `
        UPDATE mentors
        SET status = 'expired'
        WHERE status = 'ongoing'
          AND NOW() >= CONCAT(end_date, ' 20:00:00')
    `;
    db.query(query, (err, results) => {
        if (err) console.error('❌ Error expiring mentors:', err.message);
        else console.log(`✅ ${results.affectedRows} mentorships expired.`);
    });
}



// Expire mentees
function expireOldMentees() {
    const query = `
        UPDATE mentees
        SET status = 'expired'
        WHERE status = 'ongoing'
          AND NOW() >= CONCAT(end_date, ' 20:00:00')
    `;
    db.query(query, (err, results) => {
        if (err) console.error('❌ Error expiring mentees:', err.message);
        else console.log(`✅ ${results.affectedRows} mentee relationships expired.`);
    });
}


// Function to expire slot statuses based on current date and time
function expireSlotStatus() {
    const query = `
    UPDATE slot s
    JOIN (
      SELECT mentor_email, mentee_email, language_name, status
      FROM mentees m
      WHERE (mentor_email, mentee_email, language_name, start_date) IN (
        SELECT mentor_email, mentee_email, language_name, MAX(start_date)
        FROM mentees
        GROUP BY mentor_email, mentee_email, language_name
      )
    ) latest_m
    ON s.mentor_email = latest_m.mentor_email 
       AND s.mentee_email = latest_m.mentee_email 
       AND s.language = latest_m.language_name
    SET 
      s.level_cleared = CASE 
                          WHEN s.date <= CURDATE() AND s.end_time <= CURTIME() THEN 'expired'
                          ELSE s.level_cleared 
                        END,
      s.status = CASE 
                  WHEN latest_m.status = 'expired' THEN 'expired'
                  ELSE s.status
                END
    WHERE s.status = 'ongoing' AND s.level_cleared='ongoing';
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error expiring slot status:', err.message);
        } else {
            console.log(`✅ ${results.affectedRows} slot statuses and level_cleared updated.`);
        }
    });
}



// Function to run all expiration tasks
function runExpireFunctions() {
    expireOldMentorRequests();
    expireOldMenteeRequests();
    expireOldMentors();
    expireOldMentees();
    expireSlotStatus();
}

// Export the function so it can be used in other files
module.exports = { runExpireFunctions };
