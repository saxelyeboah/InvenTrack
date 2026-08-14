const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/stock-level', reportController.getStockLevel);
router.get('/stock-movements', reportController.getStockMovements);
router.get('/sales', reportController.getSales);

module.exports = router;
