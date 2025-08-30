const db = require("../config/db");

class User {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
  }

  static async create(userData) {
    const { name, email, password } = userData;
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    return result.insertId;
  }
}

module.exports = User;
