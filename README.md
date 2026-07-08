# NovaCart Full-Stack Upgrade

NovaCart is now a lightweight full-stack storefront with a real backend, persistent database, authentication, inventory management, dashboard analytics, and order workflow.

## Run locally

1. Install dependencies:
   npm install
2. Start the server:
   npm start
3. Open the site:
   http://localhost:3000
4. Open the admin experience:
   http://localhost:3000/admin-login.html

## Test

npm test

## Included features

- Express backend for products, contacts, authentication, and admin management
- SQLite database for persistent storage
- User registration and login
- Database-backed admin login with seeded admin credentials
- Admin dashboard with stats cards, progress charts, and order management
- Product create/edit/delete and image upload UI
- Checkout flow that stores orders and lets admins update status

## Deploy to a live host

### Render

1. Create a new Web Service on Render.
2. Connect this repository.
3. Render will use the included [render.yaml](render.yaml) file automatically.
4. Set environment variables:
   - `ADMIN_EMAIL=admin@novacart.com`
   - `ADMIN_PASSWORD=admin1234`
5. Deploy the service.
6. In the Render dashboard, open the service and add your custom domain under Domains.

### Railway

1. Create a new project and connect the repository.
2. Railway will detect the Node app automatically from [package.json](package.json) and [railway.toml](railway.toml).
3. Add the same environment variables above.
4. Deploy the service.
5. In Railway, open the deployment settings and attach your custom domain.

### GitHub deployment note

If you want a public repo-based deployment, push this project to GitHub first, then connect that repository to Render or Railway.

### Notes

- The app uses SQLite, so the database file is persisted on the host filesystem for simple deployments.
- For production-scale traffic, consider PostgreSQL or MongoDB.
- The admin login is now backed by a database table, so you can safely change credentials through environment variables.
