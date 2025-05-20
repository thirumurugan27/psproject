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
          (date = CURDATE() AND end_time <= CURTIME())
        );
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error expiring level_cleared:', err.message);
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


// delete expired data from all tables
function cleanupExpiredData(req, res) {
    const queries = [
        { sql: "DELETE FROM mentors WHERE status = 'expired'", table: 'mentors', emoji: '🧑‍🏫' },
        { sql: "DELETE FROM mentees WHERE status = 'expired'", table: 'mentees', emoji: '🧑‍🎓' },
        { sql: "DELETE FROM slot WHERE status = 'expired'", table: 'slot', emoji: '⏰' },
        {
            sql: "DELETE FROM mentor_requests WHERE DATEDIFF(CURDATE(), request_date) >= 8",
            table: 'mentor_requests',
            emoji: '📨'
        },
        {
            sql: "DELETE FROM mentee_requests WHERE DATEDIFF(CURDATE(), request_date) >= 8",
            table: 'mentee_requests',
            emoji: '📩'
        }
    ];

    let completed = 0;

    queries.forEach(({ sql, table, emoji }) => {
        db.query(sql, (err, result) => {
            completed++;

            if (err) {
                console.error(`${emoji} Error deleting from ${table}:`, err);
            } else {
                console.log(`${emoji} Deleted ${result.affectedRows} row(s) from ${table}`);
            }

            if (completed === queries.length) {
                if (res && typeof res.status === 'function') {
                    res.status(200).json({ message: '🧹 Cleanup completed' });
                } else {
                    console.log('🧹 Cleanup completed');
                }
            }
        });
    });
}


// Function to run all expiration tasks
function runExpireFunctions() {
    // settimezone();
    expireOldMentorRequests();
    expireOldMenteeRequests();
    expireOldMentors();
    expireOldMentees();
    expireLevelClearedSlots();
    syncSlotStatusWithMentees();
    cleanupExpiredData();
   
}



module.exports = { runExpireFunctions };
