const db = require('../db/db');
const productRepository = require('../repositories/productRepository');
const stockRepository = require('../repositories/stockRepository');

class InventoryService {
  async processStockMovement({ product_id, supplier_id, movement_type, quantity, reason, user_id, user_role, allow_negative_override = false }) {
    if (!product_id || !movement_type || quantity === undefined || quantity <= 0) {
      throw { statusCode: 400, message: 'Valid Product ID, movement type, and positive quantity are required' };
    }

    if (!['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'].includes(movement_type)) {
      throw { statusCode: 400, message: 'Invalid movement type. Must be STOCK_IN, STOCK_OUT, or ADJUSTMENT' };
    }

    if (movement_type === 'ADJUSTMENT' && (!reason || reason.trim().length === 0)) {
      throw { statusCode: 400, message: 'Mandatory reason note is required for manual stock adjustment' };
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const product = await productRepository.findById(product_id, client);
      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      if (!product.is_active) {
        throw { statusCode: 400, message: 'Cannot record stock movement for deactivated product' };
      }

      let newQuantity = product.quantity_on_hand;

      if (movement_type === 'STOCK_IN') {
        newQuantity += parseInt(quantity, 10);
      } else if (movement_type === 'STOCK_OUT') {
        const qtyToDeduct = parseInt(quantity, 10);
        if (newQuantity - qtyToDeduct < 0) {
          if (user_role === 'ADMIN' && allow_negative_override) {
            newQuantity = 0; // Admin explicit override floors at 0 or allows negative if needed, but per FR-3.6 prevents negative balance
          } else {
            throw { statusCode: 400, message: `Insufficient stock on hand (${newQuantity} available, requested ${qtyToDeduct}). Transaction blocked.` };
          }
        } else {
          newQuantity -= qtyToDeduct;
        }
      } else if (movement_type === 'ADJUSTMENT') {
        // Adjustment specifies exact target quantity or delta. We treat quantity as absolute new stock level target if passed as target, or delta
        // Standard spec: Adjustment sets the target stock level or adjusts directly. Let's support new absolute target
        newQuantity = parseInt(quantity, 10);
        if (newQuantity < 0) {
          throw { statusCode: 400, message: 'Stock quantity cannot be adjusted to a negative value' };
        }
      }

      // Update Product Quantity
      await productRepository.updateQuantity(product_id, newQuantity, client);

      // Create Audit Log Movement
      const movement = await stockRepository.createMovement({
        product_id,
        supplier_id: movement_type === 'STOCK_IN' ? supplier_id : null,
        performed_by_user_id: user_id,
        movement_type,
        quantity: parseInt(quantity, 10),
        reason: reason ? reason.trim() : null
      }, client);

      await client.query('COMMIT');

      const isLowStock = newQuantity <= product.reorder_level;

      return {
        movement,
        updated_product: {
          ...product,
          quantity_on_hand: newQuantity,
          is_low_stock: isLowStock
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err.statusCode ? err : { statusCode: 500, message: err.message || 'Error processing stock movement' };
    } finally {
      client.release();
    }
  }

  async getMovementsHistory(filters) {
    return await stockRepository.findMovements(filters);
  }
}

module.exports = new InventoryService();
