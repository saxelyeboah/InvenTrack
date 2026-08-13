const db = require('../db/db');

class SupplierRepository {
  async findAll() {
    const res = await db.query('SELECT * FROM suppliers ORDER BY name ASC');
    return res.rows;
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async create({ name, contact_person, phone, email }) {
    const res = await db.query(
      `INSERT INTO suppliers (name, contact_person, phone, email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), contact_person || null, phone || null, email || null]
    );
    return res.rows[0];
  }

  async update(id, { name, contact_person, phone, email }) {
    const res = await db.query(
      `UPDATE suppliers
       SET name = $1, contact_person = $2, phone = $3, email = $4
       WHERE id = $5 RETURNING *`,
      [name.trim(), contact_person || null, phone || null, email || null, id]
    );
    return res.rows[0] || null;
  }

  async delete(id) {
    const res = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  }
}

module.exports = new SupplierRepository();
