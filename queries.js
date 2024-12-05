const {response} = require("express");
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'Zenek4martyniuk9',
    database: 'aji',
  },
});

const getCategories = async (request, response) => {
  try {
    const results = await knex.select('*').from('categories');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
};

const getProducts = async (request, response) => {
  try {
    const results = await knex.select('*').from('products');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

const getProductById = async (request, response) => {
  const id = parseInt(request.params.id)

  try {
    const result = await knex.select('*').from('products').where('product_id', id);
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

const createProduct = async (request, response) => {
  const { name, description, unit_cost, unit_weigth, product_category_id } = request.body;

  try {
    const [newProduct] = await knex('products')
      .insert({
        name,
        description,
        unit_cost,
        unit_weigth,
        product_category_id
      })
      .returning('*'); // Zwraca dodany rekord

    response.status(201).send(`Product added with ID: ${newProduct.id}`);
  } catch (error) {
    console.error('Error adding product:', error);
    response.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, description, unit_cost, unit_weigth, product_category_id } = request.body

  pool.query(
    'UPDATE products SET name = $1, description = $2, unit_cost = $3, unit_weigth = $4, product_category_id = $5 WHERE product_id = $6',
    [name, description, unit_cost, unit_weigth, product_category_id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const getOrders = async (request, response) => {
  try {
    const results = await knex.select('*').from('orders');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

const getOrdersStatus = (request, response) => {
  const id = parseInt(request.params.id)
  pool.query('SELECT * FROM orders join order_status on order_status.status_id = orders.order_status_id where status_id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createOrder = async (request, response) => {
  const { product_id, quantity, accept_date, order_status_id, user_name, email, telephone_number } = request.body

  try {
    const [newOrder] = await knex('orders')
    .insert({
      accept_date,
      order_status_id,
      user_name,
      email,
      telephone_number
    })
        .returning('*');

    const order_id = newOrder.order_id

    const [newProductOrder] = await knex('product_orders')
    .insert({
      product_id,
      order_id,
      quantity
    })
    .returning('*');

    response.status(201).send(`Order added with ID: ${newOrder.id}`);
  } catch (error){
      console.error(error);
      response.status(500).json({error: 'Failed to create order'});
  }
}

const getStatus = async (request, response) => {
  try {
    const results = await knex.select('*').from('order_status');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  getOrders,
  createOrder,
  getOrdersStatus,
  getStatus,
  updateProduct
}