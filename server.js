const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { initialize, all, get, run, hashPassword } = require('./db');

function createToken(user) {
  return crypto.createHash('sha256').update(`${user.id}:${user.email}:${Date.now()}`).digest('hex');
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Admin access denied' });
  }
  next();
}

async function createApp() {
  await initialize();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'docs')));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/products', async (req, res) => {
    const products = await all('SELECT * FROM products ORDER BY id');
    res.json({ products });
  });

  app.get('/api/products/:id', async (req, res) => {
    const product = await get('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    const created = await run('INSERT INTO contacts (name, email, message, createdAt) VALUES (?, ?, ?, ?)', [name, email, message, new Date().toISOString()]);
    const entry = { id: created.id, name, email, message, createdAt: new Date().toISOString() };
    res.json({ success: true, message: entry });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const created = await run('INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)', [name, email.toLowerCase(), hashPassword(password), new Date().toISOString()]);
    const user = { id: created.id, name, email: email.toLowerCase() };

    res.json({ success: true, user, token: createToken(user) });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token: createToken({ id: user.id, email: user.email }) });
  });

  app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase();
    const requestedPassword = password || '';

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase() && requestedPassword === process.env.ADMIN_PASSWORD) {
      const token = createToken({ id: 0, email: normalizedEmail });
      process.env.ADMIN_TOKEN = token;
      return res.json({ success: true, token });
    }

    const admin = await get('SELECT * FROM admins WHERE email = ?', [normalizedEmail]);
    if (admin && admin.password === hashPassword(requestedPassword)) {
      const token = createToken({ id: admin.id, email: normalizedEmail });
      process.env.ADMIN_TOKEN = token;
      return res.json({ success: true, token });
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    const { name, category, price, oldPrice, discount, rating, reviews, stock, description, image, featured, newest, bestSeller } = req.body;
    if (!name || !category || !price || !description) {
      return res.status(400).json({ error: 'Please provide all required product fields' });
    }

    const created = await run(
      'INSERT INTO products (name, category, price, oldPrice, discount, rating, reviews, stock, description, image, featured, newest, bestSeller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, Number(price), Number(oldPrice || price), Number(discount || 0), Number(rating || 0), Number(reviews || 0), stock || 'In Stock', description, image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', featured ? 1 : 0, newest ? 1 : 0, bestSeller ? 1 : 0]
    );

    res.json({ success: true, product: { id: created.id, name, category, price: Number(price), oldPrice: Number(oldPrice || price), discount: Number(discount || 0), rating: Number(rating || 0), reviews: Number(reviews || 0), stock: stock || 'In Stock', description, image: image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', featured: Boolean(featured), newest: Boolean(newest), bestSeller: Boolean(bestSeller) } });
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const { name, category, price, oldPrice, discount, rating, reviews, stock, description, image, featured, newest, bestSeller } = req.body;
    const existing = await get('SELECT id FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await run(
      'UPDATE products SET name = ?, category = ?, price = ?, oldPrice = ?, discount = ?, rating = ?, reviews = ?, stock = ?, description = ?, image = ?, featured = ?, newest = ?, bestSeller = ? WHERE id = ?',
      [name, category, Number(price), Number(oldPrice || price), Number(discount || 0), Number(rating || 0), Number(reviews || 0), stock || 'In Stock', description, image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', featured ? 1 : 0, newest ? 1 : 0, bestSeller ? 1 : 0, Number(req.params.id)]
    );

    res.json({ success: true });
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const existing = await get('SELECT id FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await run('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true });
  });

  app.get('/api/admin/dashboard/stats', requireAdmin, async (req, res) => {
    const stats = await get(`
      SELECT
        (SELECT COUNT(*) FROM products) AS totalProducts,
        (SELECT COUNT(*) FROM orders) AS totalOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'Pending') AS pendingOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'Shipped') AS shippedOrders,
        (SELECT COALESCE(SUM(total), 0) FROM orders) AS revenue
    `);

    res.json({
      success: true,
      stats: {
        totalProducts: Number(stats.totalProducts || 0),
        totalOrders: Number(stats.totalOrders || 0),
        pendingOrders: Number(stats.pendingOrders || 0),
        shippedOrders: Number(stats.shippedOrders || 0),
        revenue: Number(stats.revenue || 0)
      }
    });
  });

  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    const orders = await all('SELECT * FROM orders ORDER BY id DESC');
    res.json({ success: true, orders });
  });

  app.post('/api/orders', async (req, res) => {
    const { customerName, email, phone, address, city, state, paymentMethod, items, total } = req.body;
    if (!customerName || !email || !phone || !address || !city || !state || !paymentMethod || !Array.isArray(items) || !total) {
      return res.status(400).json({ error: 'Please complete the order information' });
    }

    const created = await run(
      'INSERT INTO orders (customerName, email, phone, address, city, state, paymentMethod, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customerName, email, phone, address, city, state, paymentMethod, JSON.stringify(items), Number(total), 'Pending', new Date().toISOString()]
    );

    res.json({ success: true, order: { id: created.id, customerName, email, phone, address, city, state, paymentMethod, items, total: Number(total), status: 'Pending' } });
  });

  app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    const { status } = req.body;
    const existing = await get('SELECT id FROM orders WHERE id = ?', [Number(req.params.id)]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await run('UPDATE orders SET status = ? WHERE id = ?', [status || 'Pending', Number(req.params.id)]);
    res.json({ success: true });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  });

  return app;
}

function startServer(port = process.env.PORT || 3000) {
  return createApp().then((app) => {
    return new Promise((resolve, reject) => {
      const host = process.env.HOST || '0.0.0.0';
      const server = app.listen(Number(port), host, () => {
        console.log(`NovaCart backend running on http://${host}:${port}`);
        resolve(server);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Please stop the other process or set a different PORT.`);
        }
        reject(error);
      });
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { createApp, startServer };
