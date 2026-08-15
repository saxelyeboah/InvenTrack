const db = require('./db');

const migrate = async () => {
  const client = await db.getClient();
  try {
    console.log('Starting schema migration...');
    await client.query('BEGIN');

    // Create Custom Enum Types if not exists
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE movement_type AS ENUM ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL DEFAULT 'STAFF',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // 3. Suppliers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          contact_person VARCHAR(100),
          phone VARCHAR(50),
          email VARCHAR(255)
      );
    `);

    // 4. Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          sku VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          reorder_level INTEGER NOT NULL DEFAULT 5,
          quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Stock Movements Audit Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
          performed_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          movement_type movement_type NOT NULL,
          quantity INTEGER NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Sales Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
          id SERIAL PRIMARY KEY,
          recorded_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          total_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Sale Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
          id SERIAL PRIMARY KEY,
          sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price DECIMAL(10, 2) NOT NULL
      );
    `);

    // Performance Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(quantity_on_hand, reorder_level);
      CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    if (require.main === module && db.pool) {
      await db.pool.end();
    }
  }
};

if (require.main === module) {
  migrate();
}

module.exports = migrate;
