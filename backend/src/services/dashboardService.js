const db = require('../db/db');

class DashboardService {
  async getDashboardSummary() {
    // 1. Total Active Products Count & Total Inventory Valuation
    const valuationRes = await db.query(`
      SELECT 
        COUNT(CASE WHEN is_active = TRUE OR is_active = 1 THEN 1 END) AS total_active_products,
        COALESCE(SUM(CASE WHEN is_active = TRUE OR is_active = 1 THEN quantity_on_hand * cost_price ELSE 0 END), 0.00) AS total_stock_valuation,
        COUNT(CASE WHEN (is_active = TRUE OR is_active = 1) AND quantity_on_hand <= reorder_level THEN 1 END) AS low_stock_count
      FROM products
    `);

    // 2. Low-Stock Alert Items List
    const lowStockRes = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE AND p.quantity_on_hand <= p.reorder_level
      ORDER BY (p.reorder_level - p.quantity_on_hand) DESC, p.name ASC
    `);

    // 3. Recent Movements Activity
    const recentMovementsRes = await db.query(`
      SELECT sm.*, p.name AS product_name, u.name AS user_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN users u ON sm.performed_by_user_id = u.id
      ORDER BY sm.created_at DESC
      LIMIT 5
    `);

    const summary = valuationRes.rows[0];

    return {
      total_active_products: parseInt(summary.total_active_products, 10),
      total_stock_valuation: parseFloat(summary.total_stock_valuation).toFixed(2),
      low_stock_count: parseInt(summary.low_stock_count, 10),
      low_stock_items: lowStockRes.rows,
      recent_movements: recentMovementsRes.rows
    };
  }
}

module.exports = new DashboardService();
