const db = require('../db/db');

class StockRepository {
  async createMovement({ product_id, supplier_id, performed_by_user_id, movement_type, quantity, reason }, client = db) {
    const res = await client.query(
      `INSERT INTO stock_movements (product_id, supplier_id, performed_by_user_id, movement_type, quantity, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [product_id, supplier_id || null, performed_by_user_id, movement_type, quantity, reason || null]
    );
    return res.rows[0];
  }

  async findMovements({ product_id, movement_type, start_date, end_date }) {
    let sql = `
      SELECT sm.*,
             p.name AS product_name, p.sku AS product_sku,
             sup.name AS supplier_name,
             u.name AS user_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN suppliers sup ON sm.supplier_id = sup.id
      JOIN users u ON sm.performed_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      params.push(product_id);
      sql += ` AND sm.product_id = $${params.length}`;
    }

    if (movement_type) {
      params.push(movement_type);
      sql += ` AND sm.movement_type = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      sql += ` AND sm.created_at >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      sql += ` AND sm.created_at <= $${params.length}`;
    }

    sql += ` ORDER BY sm.created_at DESC`;

    const res = await db.query(sql, params);
    return res.rows;
  }
}

module.exports = new StockRepository();
