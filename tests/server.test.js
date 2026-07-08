const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, createApp } = require('../server');

let server;
let baseUrl;
const uniqueEmail = `test.user+${Date.now()}@example.com`;

test.before(async () => {
  const app = await createApp();
  server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/products returns product data', async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(Array.isArray(payload.products));
  assert.ok(payload.products.length > 0);
});

test('POST /api/contact stores a message', async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'Hello from tests' })
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.message.name, 'Ada');
});

test('POST /api/auth/register creates a user', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: uniqueEmail, password: 'password123' })
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.user.email, uniqueEmail);
});

test('POST /api/auth/login authenticates a user', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.ok(payload.token);
});

test('admin can create, update, and delete a product', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novacart.com', password: 'admin1234' })
  });
  const loginPayload = await loginResponse.json();
  const token = loginPayload.token;

  const createResponse = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Product',
      category: 'Accessories',
      price: 55,
      oldPrice: 70,
      discount: 20,
      rating: 4.5,
      reviews: 5,
      stock: 'In Stock',
      description: 'Temporary product',
      image: 'https://example.com/image.jpg',
      featured: true,
      newest: false,
      bestSeller: false
    })
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 200);
  assert.equal(created.success, true);

  const updateResponse = await fetch(`${baseUrl}/api/admin/products/${created.product.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Updated Test Product',
      category: 'Accessories',
      price: 60,
      oldPrice: 75,
      discount: 20,
      rating: 4.7,
      reviews: 8,
      stock: 'In Stock',
      description: 'Updated temporary product',
      image: 'https://example.com/image-updated.jpg',
      featured: true,
      newest: true,
      bestSeller: true
    })
  });
  assert.equal(updateResponse.status, 200);

  const deleteResponse = await fetch(`${baseUrl}/api/admin/products/${created.product.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(deleteResponse.status, 200);
});

test('admin login can use database-backed credentials and dashboard stats are exposed', async () => {
  process.env.ADMIN_EMAIL = 'dbadmin@example.com';
  process.env.ADMIN_PASSWORD = 'dbpass123';

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
  });

  assert.equal(loginResponse.status, 200);
  const loginPayload = await loginResponse.json();
  assert.equal(loginPayload.success, true);

  const statsResponse = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
    headers: { Authorization: `Bearer ${loginPayload.token}` }
  });
  assert.equal(statsResponse.status, 200);

  const statsPayload = await statsResponse.json();
  assert.ok(statsPayload.stats.totalProducts >= 1);
  assert.ok(statsPayload.stats.totalOrders >= 0);
});

test('checkout can create an order and admin can change its status', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novacart.com', password: 'admin1234' })
  });
  const loginPayload = await loginResponse.json();
  const token = loginPayload.token;

  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '+233555000111',
      address: '123 Market Road',
      city: 'Accra',
      state: 'Greater Accra',
      paymentMethod: 'Mobile Money',
      items: [{ name: 'Aurora Smartwatch', quantity: 1, price: 249 }],
      total: 249
    })
  });

  assert.equal(orderResponse.status, 200);
  const orderPayload = await orderResponse.json();
  assert.equal(orderPayload.success, true);
  assert.ok(orderPayload.order.id);

  const ordersResponse = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(ordersResponse.status, 200);
  const ordersPayload = await ordersResponse.json();
  assert.ok(ordersPayload.orders.length >= 1);

  const updateResponse = await fetch(`${baseUrl}/api/admin/orders/${orderPayload.order.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Shipped' })
  });
  assert.equal(updateResponse.status, 200);
});
