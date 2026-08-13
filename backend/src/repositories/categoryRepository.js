const db = require('../db/db');

class CategoryRepository {
  async findAll() {
    const res = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async create(name) {
    const res = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name.trim()]);
    return res.rows[0];
  }

  async delete(id) {
    const res = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  }
}

module.exports = new CategoryRepository();
