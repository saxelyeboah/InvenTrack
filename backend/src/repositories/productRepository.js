const db = require('../db/db');

class ProductRepository {
  async findAll({ search, category_id, active_only = false }) {
    let sql = `
      SELECT p.*, c.name AS category_name,
             COALESCE(
               (SELECT MAX(sm.created_at) FROM stock_movements sm WHERE sm.product_id = p.id),
               p.created_at
             ) AS last_activity_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (active_only) {
      sql += ` AND p.is_active = TRUE`;
    }

    if (category_id) {
      params.push(category_id);
      sql += ` AND p.category_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    sql += ` ORDER BY last_activity_at DESC, p.id DESC`;

    const res = await db.query(sql, params);
    return res.rows;
  }

  async findById(id, client = db) {
    const res = await client.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findBySku(sku) {
    const res = await db.query('SELECT * FROM products WHERE UPPER(sku) = UPPER($1)', [sku.trim()]);
    return res.rows[0] || null;
  }

  async create({ sku, name, category_id, cost_price, selling_price, reorder_level, quantity_on_hand }) {
    const res = await db.query(
      `INSERT INTO products (sku, name, category_id, cost_price, selling_price, reorder_level, quantity_on_hand, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [
        sku.trim().toUpperCase(),
        name.trim(),
        category_id || null,
        cost_price || 0.00,
        selling_price || 0.00,
        reorder_level || 5,
        quantity_on_hand || 0
      ]
    );
    return res.rows[0];
  }

  async update(id, { sku, name, category_id, cost_price, selling_price, reorder_level }) {
    const res = await db.query(
      `UPDATE products
       SET sku = $1, name = $2, category_id = $3, cost_price = $4, selling_price = $5, reorder_level = $6
       WHERE id = $7 RETURNING *`,
      [
        sku.trim().toUpperCase(),
        name.trim(),
        category_id || null,
        cost_price || 0.00,
        selling_price || 0.00,
        reorder_level || 5,
        id
      ]
    );
    return res.rows[0] || null;
  }

  async updateQuantity(id, newQuantity, client = db) {
    const res = await client.query(
      `UPDATE products SET quantity_on_hand = $1 WHERE id = $2 RETURNING *`,
      [newQuantity, id]
    );
    return res.rows[0] || null;
  }

  async setStatus(id, isActive) {
    const res = await db.query(
      `UPDATE products SET is_active = $1 WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
    return res.rows[0] || null;
  }
}

module.exports = new ProductRepository();
