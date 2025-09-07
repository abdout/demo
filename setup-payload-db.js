const { Pool } = require('pg');
require('dotenv').config();

async function setupPayloadDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Setting up Payload database...');
    
    // Create payload schema if it doesn't exist
    await pool.query(`CREATE SCHEMA IF NOT EXISTS payload;`);
    console.log('✅ Created payload schema');
    
    // Set search path to include payload schema
    await pool.query(`SET search_path TO payload, public;`);
    
    // Create basic Payload tables if they don't exist
    const tables = [
      `CREATE TABLE IF NOT EXISTS payload.users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        password VARCHAR(255),
        roles TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(20),
        parent_id INTEGER REFERENCES payload.categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        stripe_account_id VARCHAR(255),
        stripe_details_submitted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.books (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        description JSONB,
        price DECIMAL(10, 2),
        category_id INTEGER REFERENCES payload.categories(id),
        tenant_id INTEGER REFERENCES payload.tenants(id),
        refund_policy VARCHAR(50),
        content JSONB,
        is_private BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255),
        url VARCHAR(500),
        mimetype VARCHAR(100),
        filesize INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        stripe_checkout_session_id VARCHAR(255),
        stripe_account_id VARCHAR(255),
        user_id INTEGER REFERENCES payload.users(id),
        book_id INTEGER REFERENCES payload.books(id),
        tenant_id INTEGER REFERENCES payload.tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.reviews (
        id SERIAL PRIMARY KEY,
        description TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        book_id INTEGER REFERENCES payload.books(id),
        user_id INTEGER REFERENCES payload.users(id),
        tenant_id INTEGER REFERENCES payload.tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.users_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES payload.users(id),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.book_tags (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES payload.books(id),
        tag_id INTEGER REFERENCES payload.tags(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS payload.user_tenants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES payload.users(id),
        tenant_id INTEGER REFERENCES payload.tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of tables) {
      await pool.query(query);
    }
    
    console.log('✅ Created all Payload tables');
    
    // Check if data exists
    const userCount = await pool.query('SELECT COUNT(*) FROM payload.users');
    const bookCount = await pool.query('SELECT COUNT(*) FROM payload.books');
    
    console.log(`📊 Current data: ${userCount.rows[0].count} users, ${bookCount.rows[0].count} books`);
    
    if (userCount.rows[0].count === '0') {
      console.log('\n⚠️  No data found. Please run: pnpm db:seed:payload');
    }
    
    console.log('\n✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupPayloadDatabase();