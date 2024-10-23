import sqlite from "sqlite3";
const db = new sqlite.Database(__dirname + "/database.db");
function registerUser(chat_id) {
  // Check if uesrs table exists
  db.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
    (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!row) {
        db.run(`CREATE TABLE users (chat_id INTEGER PRIMARY KEY, line TEXT)`);
        return;
      }
    }
  );
  // Check if user exists
  db.get(`SELECT * FROM users WHERE chat_id = ?`, [chat_id], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row) {
      return;
    } else {
      db.run(`INSERT INTO users (chat_id) VALUES (?)`, [chat_id]);
      return;
    }
  });
}
async function setLine(chat_id, line) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET line = ? WHERE chat_id = ?`,
      [line, chat_id],
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  });
}
async function getLine(chat_id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT line FROM users WHERE chat_id = ?`,
      [chat_id],
      (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (row) {
          resolve(row.line);
        } else {
          resolve(null);
        }
      }
    );
  });
}
export { db, registerUser, setLine, getLine };
