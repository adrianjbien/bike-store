const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000
const { authenticateToken, checkRole } = require('./auth-middleware');
const StatusCodes = require('http-status-codes');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })
app.get('/categories', authenticateToken, checkRole(['KLIENT']),   db.getCategories);
app.get('/products', authenticateToken, checkRole(['KLIENT']), db.getProducts);
app.get('/products/:id', authenticateToken, checkRole(['KLIENT']),  db.getProductById);
app.post('/products', authenticateToken, checkRole(['PRACOWNIK']), db.createProduct);
app.put('/products/:id', authenticateToken, checkRole(['PRACOWNIK']), db.updateProduct);
app.get('/products/:id/seo-description', authenticateToken, checkRole(['PRACOWNIK']), db.getProductSeoDescription)
app.get('/orders', authenticateToken, checkRole(['KLIENT']), db.getOrders);
app.post('/orders', authenticateToken, checkRole(['KLIENT']), db.createOrder);
app.get('/orders/status/:id', authenticateToken, checkRole(['KLIENT']), db.getOrdersStatus);

app.put('/orders/:id', authenticateToken, checkRole(['PRACOWNIK']), db.updateOrderStatus);

app.post('/auth/login', db.login);
app.post('/auth/refresh-token', db.refreshToken);
app.post('/init', authenticateToken, checkRole(['PRACOWNIK']), db.initDatabase)


app.listen(port, () => {
console.log(`App running on port ${port}.`)
})