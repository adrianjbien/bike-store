const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })


app.get('/categories', db.getCategories)
app.get('/products', db.getProducts)
app.get('/products/:id', db.getProductById)
app.post('/products', db.createProduct)
app.put('/products/:id', db.updateProduct)
app.get('/orders', db.getOrders)
app.get('/orders/status/:id', db.getOrdersStatus)
app.post('/orders', db.createOrder)
app.get('/status', db.getStatus)
app.get('/order/:id/products', db.showProductsInOrder)
app.put('/orders/:id', db.updateOrderStatus)



app.listen(port, () => {
console.log(`App running on port ${port}.`)
})






