const StatusCodes = require('http-status-codes');



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
        .json({ error: 'Database query failed' });
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

  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid product data',
      details: 'Name and description must be non-empty, cost and weight must be positive values.',
    });
  }

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
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create product', details: error.message });
  }
};

const updateProduct = async (request, response) => {
  const id = parseInt(request.params.id)
  const { name, description, unit_cost, unit_weigth, product_category_id } = request.body;

  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid product data',
      details: 'Name and description must be non-empty, cost and weight must be positive values.',
    });
  }

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

    if (!update) {
      return response.status(404).json({
        error: 'Product not found',
        details: `No product found with ID: ${id}`,
      })}

    response.status(StatusCodes.OK).send(`Product updated with ID: ${id}`);

  } catch (error) {
    console.error('Error updating product:', error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update product', details: error.message });
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

  if (!user_name || !email || !telephone_number) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid user data',
      details: 'User name, email, and telephone number are required.',
    });
  }
  if (!/^\d+$/.test(telephone_number)) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid phone number',
      details: 'Telephone number must contain only digits.',
    });
  }
  // Walidacja produktów
  if (!products || products.length === 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'No products provided',
      details: 'Order must include at least one product.',
    });
  }

  for (const product of products) {
    if (product.quantity <= 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid product quantity',
        details: `Quantity for product ID ${product.product_id} must be greater than zero.`,
      });
    }
  }

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
    response.status(StatusCodes.CREATED).json({ message: `Order created`, order: newOrder });
  } catch (error) {
      console.error('Error creating order:', error);
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create order', details: error.message });
  }
}

const updateOrderStatus = async (request, response) => {
  const id = parseInt(request.params.id)
  const {order_status_id} = request.body

  const order = await knex('orders').where('order_id', id)

  if (!order) {
    return response.status(StatusCodes.NOT_FOUND).json({
      error: 'Order not found',
      details: `No order found with ID: ${id}`,
    });
  }
  if (order.order_status_id === 'CANCELLED') {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Cannot update cancelled order',
      details: 'Once an order is cancelled, its status cannot be changed.',
    });
  }
  if (order.order_status_id > order_status_id) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid status update',
      details: 'Order status cannot be downgraded.',
    });
  }

  try {
    const newOrder = await knex('orders').where("order_id", id).update({
      order_status_id: order_status_id,
    })
    response.status(StatusCodes.OK).json({ message: `Order status updated`, order: newOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update order status', details: error.message });
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
