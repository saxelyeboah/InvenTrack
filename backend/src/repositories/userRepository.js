const db = require('../db/db');

class UserRepository {
  async findByEmail(email) {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await db.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findAll() {
    const res = await db.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id ASC');
    return res.rows;
  }

  async create({ name, email, password_hash, role = 'STAFF' }) {
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role]
    );
    return res.rows[0];
  }

  async updateStatus(id, isActive) {
    const res = await db.query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active`,
      [isActive, id]
    );
    return res.rows[0] || null;
  }

  async update(id, { name, role }) {
    const res = await db.query(
      `UPDATE users SET name = $1, role = $2 WHERE id = $3 RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), role, id]
    );
    return res.rows[0] || null;
  }
}

module.exports = new UserRepository();
