const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'novacart.db');
const db = new sqlite3.Database(dbPath);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initialize() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Administrator',
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      oldPrice REAL NOT NULL,
      discount INTEGER NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      stock TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      newest INTEGER NOT NULL DEFAULT 0,
      bestSeller INTEGER NOT NULL DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      createdAt TEXT NOT NULL
    )
  `);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@novacart.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  await run(`
    INSERT OR IGNORE INTO admins (email, password, role, createdAt)
    VALUES (?, ?, ?, ?)
  `, [adminEmail, hashPassword(adminPassword), 'admin', new Date().toISOString()]);

  const productCount = await get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    const seedProducts = [
      ['Aurora Smartwatch', 'Watches', 249, 329, 24, 4.8, 132, 'In Stock', 'A premium smartwatch with health tracking and elegant design.', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80', 1, 1, 1],
      ['Luma Headphones', 'Electronics', 159, 199, 20, 4.6, 88, 'In Stock', 'Immersive sound and adaptive noise cancellation for everyday use.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', 1, 0, 1],
      ['Velora Sneakers', 'Shoes', 119, 149, 20, 4.7, 104, 'Low Stock', 'Lightweight sneakers built for comfort and all-day movement.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 0, 1, 1],
      ['Nova Blender', 'Home & Kitchen', 89, 119, 25, 4.4, 67, 'In Stock', 'Compact kitchen blender with powerful performance and easy cleanup.', 'https://images.unsplash.com/photo-1577303935007-0d306ee638f0?auto=format&fit=crop&w=900&q=80', 1, 0, 0]
    ];

    const insert = db.prepare(`
      INSERT INTO products (name, category, price, oldPrice, discount, rating, reviews, stock, description, image, featured, newest, bestSeller)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const product of seedProducts) {
      insert.run(product);
    }
    insert.finalize();
  }
}

module.exports = { db, initialize, run, get, all, hashPassword };
