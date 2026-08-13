const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/move', stockController.recordMovement);
router.get('/movements', stockController.getMovements);

module.exports = router;
