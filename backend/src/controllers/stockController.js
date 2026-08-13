const inventoryService = require('../services/inventoryService');

class StockController {
  async recordMovement(req, res, next) {
    try {
      const { product_id, supplier_id, movement_type, quantity, reason, allow_negative_override } = req.body;
      const user_id = req.user.id;
      const user_role = req.user.role;

      const result = await inventoryService.processStockMovement({
        product_id,
        supplier_id,
        movement_type,
        quantity,
        reason,
        user_id,
        user_role,
        allow_negative_override
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMovements(req, res, next) {
    try {
      const { product_id, movement_type, start_date, end_date } = req.query;
      const history = await inventoryService.getMovementsHistory({
        product_id,
        movement_type,
        start_date,
        end_date
      });
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StockController();
