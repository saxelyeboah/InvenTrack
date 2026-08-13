const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', supplierController.getAll);
router.post('/', requireRole('ADMIN'), supplierController.create);
router.put('/:id', requireRole('ADMIN'), supplierController.update);
router.delete('/:id', requireRole('ADMIN'), supplierController.delete);

module.exports = router;
