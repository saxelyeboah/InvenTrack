const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', salesController.createSale);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);

module.exports = router;
