const db = require('../db/db');

class ReportService {
  async getStockLevelReport() {
    const res = await db.query(`
      SELECT 
        p.id, p.sku, p.name, c.name AS category_name,
        p.cost_price, p.selling_price, p.reorder_level, p.quantity_on_hand,
        (p.quantity_on_hand * p.cost_price) AS total_cost_value,
        (p.quantity_on_hand * p.selling_price) AS total_selling_value,
        (p.quantity_on_hand <= p.reorder_level) AS is_low_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.name ASC
    `);

    return res.rows.map(row => ({
      ...row,
      cost_price: parseFloat(row.cost_price).toFixed(2),
      selling_price: parseFloat(row.selling_price).toFixed(2),
      total_cost_value: parseFloat(row.total_cost_value).toFixed(2),
      total_selling_value: parseFloat(row.total_selling_value).toFixed(2)
    }));
  }

  async getStockMovementReport({ start_date, end_date, product_id }) {
    let sql = `
      SELECT 
        sm.id, sm.created_at, sm.movement_type, sm.quantity, sm.reason,
        p.sku AS product_sku, p.name AS product_name,
        sup.name AS supplier_name,
        u.name AS performed_by
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

  async getSalesReport({ start_date, end_date }) {
    let sql = `
      SELECT 
        s.id, s.created_at, s.total_value, u.name AS recorded_by,
        (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) AS total_items
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
    return res.rows.map(row => ({
      ...row,
      total_value: parseFloat(row.total_value).toFixed(2)
    }));
  }
}

module.exports = new ReportService();
