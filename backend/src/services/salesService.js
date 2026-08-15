const db = require('../db/db');
const productRepository = require('../repositories/productRepository');
const salesRepository = require('../repositories/salesRepository');
const stockRepository = require('../repositories/stockRepository');

class SalesService {
  async processSale({ user_id, items }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw { statusCode: 400, message: 'Sale transaction must include at least one item' };
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      let totalValue = 0;
      const validatedItems = [];

      // Phase 1: Validate stock & compute totals
      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          throw { statusCode: 400, message: 'Invalid product or quantity specified in sale item' };
        }

        const product = await productRepository.findById(item.product_id, client);
        if (!product) {
          throw { statusCode: 404, message: `Product ID ${item.product_id} not found` };
        }

        if (!product.is_active) {
          throw { statusCode: 400, message: `Product "${product.name}" is deactivated` };
        }

        if (product.quantity_on_hand < item.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.quantity_on_hand}, Requested: ${item.quantity}`
          };
        }

        const unitPrice = parseFloat(product.selling_price);
        const itemTotal = unitPrice * parseInt(item.quantity, 10);
        totalValue += itemTotal;

        validatedItems.push({
          product,
          quantity: parseInt(item.quantity, 10),
          unit_price: unitPrice
        });
      }

      // Phase 2: Create Sale Master Record
      const sale = await salesRepository.createSale({
        recorded_by_user_id: user_id,
        total_value: totalValue.toFixed(2)
      }, client);

      // Phase 3: Create Line Items, Deduct Stock, and Log Movements
      const createdItems = [];
      for (const vItem of validatedItems) {
        const saleItem = await salesRepository.createSaleItem({
          sale_id: sale.id,
          product_id: vItem.product.id,
          quantity: vItem.quantity,
          unit_price: vItem.unit_price
        }, client);

        const newQty = vItem.product.quantity_on_hand - vItem.quantity;
        await productRepository.updateQuantity(vItem.product.id, newQty, client);

        await stockRepository.createMovement({
          product_id: vItem.product.id,
          supplier_id: null,
          performed_by_user_id: user_id,
          movement_type: 'STOCK_OUT',
          quantity: vItem.quantity,
          reason: `Counter Sale #${sale.id}`
        }, client);

        createdItems.push({
          ...saleItem,
          product_name: vItem.product.name,
          product_sku: vItem.product.sku
        });
      }

      await client.query('COMMIT');

      return {
        sale: {
          ...sale,
          items: createdItems
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err.statusCode ? err : { statusCode: 500, message: err.message || 'Error executing sale transaction' };
    } finally {
      client.release();
    }
  }

  async getSalesHistory(filters) {
    return await salesRepository.findSales(filters);
  }

  async getSaleDetails(id) {
    const sale = await salesRepository.findSaleById(id);
    if (!sale) {
      throw { statusCode: 404, message: 'Sale transaction not found' };
    }
    return sale;
  }
}

module.exports = new SalesService();
