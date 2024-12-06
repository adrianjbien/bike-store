const {response} = require("express");
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
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

  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(400).json({
      error: 'Invalid product data',
      details: 'Name and description must be non-empty, cost and weight must be positive values.',
    });
  }

  try {
    const [newProduct] = await knex('products')
        .insert({ name, description, unit_cost, unit_weigth, product_category_id })
        .returning('*');
    response.status(201).json({ message: `Product added`, product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    response.status(500).json({ error: 'Failed to create product', details: error.message });
  }
};

const updateProduct = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name, description, unit_cost, unit_weigth, product_category_id } = request.body;

  // Walidacja danych
  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(400).json({
      error: 'Invalid product data',
      details: 'Name and description must be non-empty, cost and weight must be positive values.',
    });
  }

  try {
    const [updatedProduct] = await knex('products')
        .where('product_id', id)
        .update({ name, description, unit_cost, unit_weigth, product_category_id })
        .returning('*');

    if (!updatedProduct) {
      return response.status(404).json({
        error: 'Product not found',
        details: `No product found with ID: ${id}`,
      });
    }

    response.status(200).json({ message: `Product updated`, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    response.status(500).json({ error: 'Failed to update product', details: error.message });
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
  const { accept_date, order_status_id, user_name, email, telephone_number, products } = request.body;

  // Walidacja danych użytkownika
  if (!user_name || !email || !telephone_number) {
    return response.status(400).json({
      error: 'Invalid user data',
      details: 'User name, email, and telephone number are required.',
    });
  }

  if (!/^\d+$/.test(telephone_number)) {
    return response.status(400).json({
      error: 'Invalid phone number',
      details: 'Telephone number must contain only digits.',
    });
  }

  // Walidacja produktów
  if (!products || products.length === 0) {
    return response.status(400).json({
      error: 'No products provided',
      details: 'Order must include at least one product.',
    });
  }

  for (const product of products) {
    if (product.quantity <= 0) {
      return response.status(400).json({
        error: 'Invalid product quantity',
        details: `Quantity for product ID ${product.product_id} must be greater than zero.`,
      });
    }
  }

  try {
    const [newOrder] = await knex('orders')
        .insert({ accept_date, order_status_id, user_name, email, telephone_number })
        .returning('*');

    for (const product of products) {
      await knex('product_orders')
          .insert({ product_id: product.product_id, order_id: newOrder.order_id, quantity: product.quantity });
    }

    response.status(201).json({ message: `Order created`, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    response.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

const updateOrderStatus = async (request, response) => {
  const id = parseInt(request.params.id);
  const { order_status_id } = request.body;

  try {
    const [order] = await knex('orders').where('order_id', id);
    if (!order) {
      return response.status(404).json({
        error: 'Order not found',
        details: `No order found with ID: ${id}`,
      });
    }

    if (order.order_status_id === 'CANCELLED') {
      return response.status(400).json({
        error: 'Cannot update cancelled order',
        details: 'Once an order is cancelled, its status cannot be changed.',
      });
    }

    if (order.order_status_id > order_status_id) {
      return response.status(400).json({
        error: 'Invalid status update',
        details: 'Order status cannot be downgraded.',
      });
    }

    const [updatedOrder] = await knex('orders')
        .where('order_id', id)
        .update({ order_status_id })
        .returning('*');

    response.status(200).json({ message: `Order status updated`, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    response.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
};

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