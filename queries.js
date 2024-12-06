import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from 'http-status-codes';

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
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
  }
}

const getProductById = async (request, response) => {
  const id = parseInt(request.params.id)

  try {
    const result = await knex.select('*').from('products').where('product_id', id);
    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database query failed' });
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

    response.status(StatusCodes.CREATED).send(`Product added with ID: ${newProduct.id}`);
  } catch (error) {
    console.error('Error adding product:', error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create product' });
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
    response.status(StatusCodes.OK).send(`Product updated with ID: ${id}`);

  } catch (error) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update product' });
  }

}

const getCategories = async (request, response) => {
  try {
    const results = await knex.select('*').from('categories');
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database query failed' });
  }
};

const getOrders = async (request, response) => {
  try {
    const results = await knex.select('*').from('orders');
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database query failed' });
  }
}

const getOrdersStatus = async (request, response) => {
  const id = parseInt(request.params.id)
  try {
    const result = await knex.select('*').from('orders').where('order_status_id', id)
    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database query failed' });
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
    response.status(StatusCodes.CREATED).send(`Order added with ID: ${newOrder.id}`);
  } catch (error){
      console.error(error);
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: 'Failed to create order'});
  }
}

const updateOrderStatus = async (request, response) => {
  const id = parseInt(request.params.id)
  const {order_status_id} = request.body

  try {
    const newOrder = await knex('orders').where("order_id", id).update({
      order_status_id: order_status_id,
    })
    response.status(StatusCodes.OK).send(`Order updated with ID: ${id}`);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: 'Failed to update order'});
  }
}

const showProductsInOrder = async (request, response) => {
  const id = parseInt(request.params.id)
  try {
    const result = await knex.select('*').from('product_orders')
        .where('order_id', id)

    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: 'Failed to show order'});
  }

}

const getStatus = async (request, response) => {
  try {
    const results = await knex.select('*').from('order_status');
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database query failed' });
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