import sqlite from 'sqlite3';
const db = new sqlite.Database('./database.db');
function registerUser(chat_id) {
    // Check if user exists
    db.get(`SELECT * FROM users WHERE chat_id = ?`, [chat_id], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (row) {
            return;
        }
        else {
            db.run(`INSERT INTO users (chat_id) VALUES (?)`, [chat_id]);
            return;
        }
    });
}
async function setLine(chat_id, line) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET line = ? WHERE chat_id = ?`, [line, chat_id], (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
async function getLine(chat_id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT line FROM users WHERE chat_id = ?`, [chat_id], (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else if (row) {
                resolve(row.line);
            }
            else {
                resolve(null);
            }
        });
    });
}
export { db, registerUser, setLine, getLine };
