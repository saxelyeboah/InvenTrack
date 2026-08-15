const db = require('../db/db');

class SalesRepository {
  async createSale({ recorded_by_user_id, total_value }, client = db) {
    const res = await client.query(
      `INSERT INTO sales (recorded_by_user_id, total_value)
       VALUES ($1, $2)
       RETURNING *`,
      [recorded_by_user_id, total_value]
    );
    return res.rows[0];
  }

  async createSaleItem({ sale_id, product_id, quantity, unit_price }, client = db) {
    const res = await client.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sale_id, product_id, quantity, unit_price]
    );
    return res.rows[0];
  }

  async findSales({ start_date, end_date }) {
    let sql = `
      SELECT s.*, u.name AS user_name,
             (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) AS item_count
      FROM sales s
      JOIN users u ON s.recorded_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      sql += ` AND s.created_at >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      sql += ` AND s.created_at <= $${params.length}`;
    }

    sql += ` ORDER BY s.created_at DESC`;

    const res = await db.query(sql, params);
    return res.rows;
  }

  async findSaleById(id) {
    const saleRes = await db.query(
      `SELECT s.*, u.name AS user_name
       FROM sales s
       JOIN users u ON s.recorded_by_user_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (saleRes.rows.length === 0) return null;

    const itemsRes = await db.query(
      `SELECT si.*, p.name AS product_name, p.sku AS product_sku
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [id]
    );

    return {
      ...saleRes.rows[0],
      items: itemsRes.rows
    };
  }
}

module.exports = new SalesRepository();
