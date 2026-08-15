const bcrypt = require('bcryptjs');
const db = require('./db');

const seed = async () => {
  const client = await db.getClient();
  try {
    console.log('Starting seed operation...');
    await client.query('BEGIN');

    // 1. Seed Admin User
    const adminEmail = 'admin@inventrack.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminId;
    if (adminCheck.rows.length === 0) {
      const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
      const adminRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['Ama Boateng (Admin)', adminEmail, hashedAdminPassword, 'ADMIN', true]
      );
      adminId = adminRes.rows[0].id;
      console.log('Seeded default Admin user: admin@inventrack.com / Admin@123');
    } else {
      adminId = adminCheck.rows[0].id;
    }

    // 2. Seed Staff User
    const staffEmail = 'staff@inventrack.com';
    const staffCheck = await client.query('SELECT id FROM users WHERE email = $1', [staffEmail]);
    if (staffCheck.rows.length === 0) {
      const hashedStaffPassword = await bcrypt.hash('Staff@123', 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        ['Kofi Mensah (Staff)', staffEmail, hashedStaffPassword, 'STAFF', true]
      );
      console.log('Seeded default Staff user: staff@inventrack.com / Staff@123');
    }

    // 3. Seed Categories
    const categories = ['Beverages', 'Groceries', 'Household Products', 'Stationery'];
    const categoryMap = {};
    for (const catName of categories) {
      const catRes = await client.query(
        `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id, name`,
        [catName]
      );
      categoryMap[catRes.rows[0].name] = catRes.rows[0].id;
    }
    console.log('Seeded default categories');

    // 4. Seed Suppliers
    const suppliersData = [
      { name: 'Golden Star Traders', contact_person: 'Kwame Mensah', phone: '+233 24 123 4567', email: 'sales@goldenstar.com' },
      { name: 'Accra Wholesale Distributors', contact_person: 'Abena Osei', phone: '+233 20 987 6543', email: 'orders@accrawholesale.com' }
    ];
    const supplierMap = {};
    for (const sup of suppliersData) {
      const supCheck = await client.query('SELECT id FROM suppliers WHERE name = $1', [sup.name]);
      if (supCheck.rows.length === 0) {
        const supRes = await client.query(
          `INSERT INTO suppliers (name, contact_person, phone, email) VALUES ($1, $2, $3, $4) RETURNING id`,
          [sup.name, sup.contact_person, sup.phone, sup.email]
        );
        supplierMap[sup.name] = supRes.rows[0].id;
      } else {
        supplierMap[sup.name] = supCheck.rows[0].id;
      }
    }
    console.log('Seeded default suppliers');

    // 5. Seed Products
    const productsData = [
      { sku: 'BEV-001', name: 'Milo 400g Tin', category_id: categoryMap['Beverages'], cost_price: 25.00, selling_price: 32.00, reorder_level: 10, quantity_on_hand: 15 },
      { sku: 'BEV-002', name: 'Ideal Milk 160g', category_id: categoryMap['Beverages'], cost_price: 5.50, selling_price: 7.00, reorder_level: 20, quantity_on_hand: 8 }, // Low stock!
      { sku: 'GRO-001', name: 'Gifford Long Grain Rice 5kg', category_id: categoryMap['Groceries'], cost_price: 85.00, selling_price: 110.00, reorder_level: 5, quantity_on_hand: 12 },
      { sku: 'GRO-002', name: 'Frytol Cooking Oil 1L', category_id: categoryMap['Groceries'], cost_price: 30.00, selling_price: 38.00, reorder_level: 8, quantity_on_hand: 4 }, // Low stock!
      { sku: 'HOU-001', name: 'Key Soap 800g', category_id: categoryMap['Household Products'], cost_price: 12.00, selling_price: 16.00, reorder_level: 15, quantity_on_hand: 25 },
      { sku: 'STA-001', name: 'A4 Exercise Book 80 pages', category_id: categoryMap['Stationery'], cost_price: 3.50, selling_price: 5.00, reorder_level: 50, quantity_on_hand: 20 } // Low stock!
    ];

    for (const prod of productsData) {
      const prodCheck = await client.query('SELECT id FROM products WHERE sku = $1', [prod.sku]);
      if (prodCheck.rows.length === 0) {
        const prodRes = await client.query(
          `INSERT INTO products (sku, name, category_id, cost_price, selling_price, reorder_level, quantity_on_hand, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
          [prod.sku, prod.name, prod.category_id, prod.cost_price, prod.selling_price, prod.reorder_level, prod.quantity_on_hand]
        );

        // Record initial Stock In movement for audit
        await client.query(
          `INSERT INTO stock_movements (product_id, supplier_id, performed_by_user_id, movement_type, quantity, reason)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [prodRes.rows[0].id, supplierMap['Golden Star Traders'], adminId, 'STOCK_IN', prod.quantity_on_hand, 'Initial stock import']
        );
      }
    }
    console.log('Seeded sample products and initial stock movement logs');

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    if (db.pool) {
      await db.pool.end();
    }
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
