const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', requireRole('ADMIN'), categoryController.create);
router.delete('/:id', requireRole('ADMIN'), categoryController.delete);

module.exports = router;
