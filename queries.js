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

const updateProduct = async (request, response) => {
  const id = parseInt(request.params.id)
  const { name, description, unit_cost, unit_weigth, product_category_id } = request.body;
  try {
    const [update] = await knex('products').where('product_id', id)
        .update({
          name,
          description,
          unit_cost,
          unit_weigth,
          product_category_id
        })
        .returning("*");
    response.status(200).send(`Product updated with ID: ${id}`);

  } catch (error) {
    response.status(500).json({ error: 'Failed to update product' });
  }

}

const getCategories = async (request, response) => {
  try {
    const results = await knex.select('*').from('categories');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
};

const getOrders = async (request, response) => {
  try {
    const results = await knex.select('*').from('orders');
    response.status(200).json(results);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

const getOrdersStatus = async (request, response) => {
  const id = parseInt(request.params.id)
  try {
    const result = await knex.select('*').from('orders').where('order_status_id', id)
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database query failed' });
  }
}

const createOrder = async (request, response) => {
  const {accept_date, order_status_id, user_name, email, telephone_number, products } = request.body

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

    // console.log(products[0]['product_id'])
    // console.log(products.length)

    for (let i=0; i<products.length; i++) {
      let product_id = products[i]['product_id']
      let quantity = products[i]['quantity']
      await knex('product_orders')
          .insert({
            product_id,
            order_id,
            quantity
          });
    }
    response.status(201).send(`Order added with ID: ${newOrder.id}`);
  } catch (error){
      console.error(error);
      response.status(500).json({error: 'Failed to create order'});
  }
}

const updateOrderStatus = async (request, response) => {
  const id = parseInt(request.params.id)
  const {order_status_id} = request.body

  try {
    const newOrder = await knex('orders').where("order_id", id).update({
      order_status_id: order_status_id,
    })
    response.status(200).send(`Order updated with ID: ${id}`);
  } catch (error) {
    console.error(error);
    response.status(500).json({error: 'Failed to update order'});
  }
}

const showProductsInOrder = async (request, response) => {
  const id = parseInt(request.params.id)
  try {
    const result = await knex.select('*').from('product_orders')
        .where('order_id', id)

    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({error: 'Failed to show order'});
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
  updateProduct,
  showProductsInOrder,
  updateOrderStatus,
}