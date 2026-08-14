const reportService = require('../services/reportService');

class ReportController {
  async getStockLevel(req, res, next) {
    try {
      const data = await reportService.getStockLevelReport();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getStockMovements(req, res, next) {
    try {
      const { start_date, end_date, product_id } = req.query;
      const data = await reportService.getStockMovementReport({ start_date, end_date, product_id });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getSales(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const data = await reportService.getSalesReport({ start_date, end_date });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
