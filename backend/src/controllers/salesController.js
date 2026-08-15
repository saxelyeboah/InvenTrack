const salesService = require('../services/salesService');

class SalesController {
  async createSale(req, res, next) {
    try {
      const { items } = req.body;
      const user_id = req.user.id;

      const result = await salesService.processSale({
        user_id,
        items
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSales(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const sales = await salesService.getSalesHistory({ start_date, end_date });
      res.json(sales);
    } catch (err) {
      next(err);
    }
  }

  async getSaleById(req, res, next) {
    try {
      const { id } = req.params;
      const sale = await salesService.getSaleDetails(id);
      res.json(sale);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SalesController();
