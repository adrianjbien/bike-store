const StatusCodes = require("http-status-codes");
const axios = require("axios");

const { response } = require("express");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "aji",
  },
});

const getProducts = async (request, response) => {
  try {
    const results = await knex.select("*").from("products");
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};

const getProductById = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const result = await knex
      .select("*")
      .from("products")
      .where("product_id", id);
    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};
const registerUser = async (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid user data",
      details: "Username, password are required.",
    });
  }

  role = "KLIENT";
  try {
    const [newUser] = await knex("users")
      .insert({
        username,
        password,
        role,
      })
      .returning("*");

    response.status(StatusCodes.CREATED).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create user", details: error.message });
  }
};

const createProduct = async (request, response) => {
  const { name, description, unit_cost, unit_weigth, product_category_id } =
    request.body;

  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid product data",
      details:
        "Name and description must be non-empty, cost and weight must be positive values.",
    });
  }

  try {
    const [newProduct] = await knex("products")
      .insert({
        name,
        description,
        unit_cost,
        unit_weigth,
        product_category_id,
      })
      .returning("*"); // Zwraca dodany rekord

    response
      .status(StatusCodes.CREATED)
      .send(`Product added with ID: ${newProduct.id}`);
  } catch (error) {
    console.error("Error adding product:", error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create product", details: error.message });
  }
};

const updateProduct = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name, description, unit_cost, unit_weigth, product_category_id } =
    request.body;

  if (!name || !description || unit_cost <= 0 || unit_weigth <= 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid product data",
      details:
        "Name and description must be non-empty, cost and weight must be positive values.",
    });
  }

  try {
    const [update] = await knex("products")
      .where("product_id", id)
      .update({
        name,
        description,
        unit_cost,
        unit_weigth,
        product_category_id,
      })
      .returning("*");

    if (!update) {
      return response.status(StatusCodes.NOT_FOUND).json({
        error: "Product not found",
        details: `No product found with ID: ${id}`,
      });
    }

    response.status(StatusCodes.OK).send(`Product updated with ID: ${id}`);
  } catch (error) {
    console.error("Error updating product:", error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update product", details: error.message });
  }
};

const getCategories = async (request, response) => {
  try {
    const results = await knex.select("*").from("categories");
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};

const getOrders = async (request, response) => {
  try {
    const results = await knex.select("*").from("orders");
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};

const getOrdersStatus = async (request, response) => {
  const id = parseInt(request.params.id);
  try {
    const result = await knex
      .select("*")
      .from("orders")
      .where("order_status_id", id);
    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};

const createOrder = async (request, response) => {
  const {
    accept_date,
    order_status_id,
    user_name,
    email,
    telephone_number,
    products,
  } = request.body;

  if (!user_name || !email || !telephone_number) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid user data",
      details: "User name, email, and telephone number are required.",
    });
  }

// Walidacja imienia i nazwiska (tylko litery, opcjonalnie z myślnikiem lub spacją)
  if (!/^[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ\s-]+$/.test(user_name)) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid user name",
      details: "User name must contain only letters, spaces, or hyphens.",
    });
  }

// Walidacja numeru telefonu (9 cyfr)
  if (!/^\d{9}$/.test(telephone_number)) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid phone number",
      details: "Telephone number must contain exactly 9 digits.",
    });
  }

// Walidacja emaila (format emailowy)
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid email",
      details: "Email must be in a valid format, e.g., user@example.com.",
    });
  }

  // Walidacja produktów
  if (!products || products.length === 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "No products provided",
      details: "Order must include at least one product.",
    });
  }

  for (const product of products) {
    if (product.quantity <= 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid product quantity",
        details: `Quantity for product ID ${product.product_id} must be greater than zero.`,
      });
    }
  }

  try {
    const [newOrder] = await knex("orders")
      .insert({
        accept_date,
        order_status_id,
        user_name,
        email,
        telephone_number,
      })
      .returning("*");

    const order_id = newOrder.order_id;

    for (let i = 0; i < products.length; i++) {
      let product_id = products[i]["product_id"];
      let quantity = products[i]["quantity"];
      await knex("product_orders").insert({
        product_id,
        order_id,
        quantity,
      });
    }
    response
      .status(StatusCodes.CREATED)
      .json({ message: `Order created`, order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create order", details: error.message });
  }
};

const updateOrderStatus = async (request, response) => {
  const id = parseInt(request.params.id);
  const { order_status_id } = request.body;

  const order = await knex("orders").where("order_id", id).first();

  if (!order) {
    return response.status(StatusCodes.NOT_FOUND).json({
      error: "Order not found",
      details: `No order found with ID: ${id}`,
    });
  }
  if (order.order_status_id === 2) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Cannot update cancelled order",
      details: "Once an order is cancelled, its status cannot be changed.",
    });
  }
  if (order.order_status_id > order_status_id) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid status update",
      details: "Order status cannot be downgraded.",
    });
  }

  try {
    let updatedOrder = null;
    if ((order.order_status_id === 1 && order_status_id !== 2) || (order.order_status_id === 1 && order_status_id === 4)) {
      let local_date = new Date()
       updatedOrder = await knex("orders")
        .where("order_id", id)
        .update({ accept_date: local_date, order_status_id: order_status_id });
    } else {
       updatedOrder = await knex("orders")
          .where("order_id", id)
          .update({ order_status_id });
    }

    if (updatedOrder) {
      return response.status(StatusCodes.OK).json({
        message: "Order status updated successfully",
      });
    } else {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to update order status",
        details: "No rows were updated",
      });
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to update order status",
      details: error.message,
    });
  }
};

const showProductsInOrder = async (request, response) => {
  const id = parseInt(request.params.id);
  try {
    const result = await knex
      .select("*")
      .from("product_orders")
      .where("order_id", id);

    response.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to show order" });
  }
};

const getStatus = async (request, response) => {
  try {
    const results = await knex.select("*").from("order_status");
    response.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error(error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Database query failed" });
  }
};
const getProductSeoDescription = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const [product] = await knex
      .select("products.*", "categories.name as category_name") // Alias the 'name' column from 'categories' as 'category_name'
      .from("products")
      .join(
        "categories",
        "products.product_category_id",
        "=",
        "categories.category_id"
      )
      .where("products.product_id", id);

    if (!product) {
      return response
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Product not found" });
    }

    const prompt = `Generate an SEO-friendly description for the following product: 
      Name: ${product.name}, 
      Category: ${product.category_name}, 
      Price: ${product.unit_cost}, 
      Description: ${product.description}.
      The output should be engaging and optimized for search engines.`;

    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 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",
    };

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        stream: false,
      },
      {
        headers: requestHeaders,
      }
    );

    if (
      aiResponse.data &&
      aiResponse.data.choices &&
      aiResponse.data.choices.length > 0 &&
      aiResponse.data.choices[0].message &&
      aiResponse.data.choices[0].message.content
    ) {
      const seoDescription = aiResponse.data.choices[0].message.content;

      const htmlContent = `
        <html>
          <head>
            <title>${product.name} - SEO Description</title>
          </head>
          <body>
            <h1>${product.name}</h1>
            <p><strong>Category:</strong> ${product.category_name}</p>
            <p><strong>Price:</strong> ${product.unit_cost}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <h2>SEO-friendly Description:</h2>
            <p>${seoDescription}</p>
          </body>
        </html>
      `;

      return response.status(StatusCodes.OK).send(htmlContent);
    } else {
      throw new Error("Unexpected API response format.");
    }
  } catch (error) {
    console.error("Error generating SEO description:", error.message);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to generate SEO description",
      details: error.message,
    });
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET;

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await knex("users").where({ username });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid credentials." });
    }

    if (password !== user.password) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecretKey, {
      expiresIn: "1h",
    });
    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    console.error("Login error:", error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Login failed." });
  }
};
const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Token is required." });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "Invalid or expired token." });
    }

    const newToken = jwt.sign({ id: user.id, role: user.role }, jwtSecretKey, {
      expiresIn: "1h",
    });

    res.status(StatusCodes.OK).json({ token: newToken });
  });
};

const initDatabase = async (request, response) => {
  const { products } = request.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid product data",
      details: "Product data must be an array with at least one product.",
    });
  }

  const existingProducts = await knex("products").select("*");
  if (existingProducts.length > 0) {
    return response.status(StatusCodes.CONFLICT).json({
      error: "Products already exist in the database",
      details: "The database already contains products.",
    });
  }

  try {
    const insertedProducts = await knex("products")
      .insert(products)
      .returning("*");
    response.status(StatusCodes.OK).json({
      message: "Products initialized successfully",
      products: insertedProducts,
    });
  } catch (error) {
    console.error("Error initializing products:", error);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to initialize products",
      details: error.message,
    });
  }
};
const deleteProduct = async (request, response) => {
  const { id } = request.params;

  try {
    const deletedRows = await knex("products").where({ product_id: id }).del();

    if (deletedRows === 0) {
      return response.status(StatusCodes.NOT_FOUND).json({
        error: "Product not found",
        details: `No product found with ID: ${id}`,
      });
    }

    response.status(StatusCodes.OK).send(`Product deleted with ID: ${id}`);
  } catch (error) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete product",
      details: error.message,
    });
  }
};
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
  getProductSeoDescription,
  login,
  refreshToken,
  initDatabase,
  registerUser,
  deleteProduct,
};
