const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const data = await dashboardService.getDashboardSummary();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
