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


// Function to expire slots
function expireLevelClearedSlots() {
    const query = `
      UPDATE slot
      SET level_cleared = 'expired'
      WHERE level_cleared = 'ongoing'
        AND (
          date < CURDATE() OR 
          (date = CURDATE() AND end_time < CURTIME())
        );
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error updating level_cleared:', err.message);
        } else {
            console.log(`✅ ${results.affectedRows} slot(s) level_cleared set to 'expired'.`);
        }
    });
}
  

//to exipire the mentoship in slots
function syncSlotStatusWithMentees() {
    const query = `
      UPDATE slot s
      JOIN (
        SELECT m1.*
        FROM mentees m1
        JOIN (
          SELECT mentor_email, mentee_email, language_name, MAX(start_date) AS latest_start
          FROM mentees
          GROUP BY mentor_email, mentee_email, language_name
        ) m2 ON m1.mentor_email = m2.mentor_email 
             AND m1.mentee_email = m2.mentee_email 
             AND m1.language_name = m2.language_name 
             AND m1.start_date = m2.latest_start
      ) latest_m ON s.mentor_email = latest_m.mentor_email 
                AND s.mentee_email = latest_m.mentee_email 
                AND s.language = latest_m.language_name
      SET s.status = latest_m.status
      WHERE s.status = 'ongoing' AND s.status != latest_m.status;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error syncing slot status:', err.message);
        } else {
            console.log(`✅ ${results.affectedRows} slot(s) status updated from mentees table.`);
        }
    });
}
  
  



// Function to run all expiration tasks
function runExpireFunctions() {
    expireOldMentorRequests();
    expireOldMenteeRequests();
    expireOldMentors();
    expireOldMentees();
    expireLevelClearedSlots();
    syncSlotStatusWithMentees();
}

// Export the function so it can be used in other files
module.exports = { runExpireFunctions };
