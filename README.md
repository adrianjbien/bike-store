# Bike Store Project

## Overview

The **Bike Store** project is a full-stack web application designed to manage bike inventory, sales, and customer interactions. The backend is built using **Express.js** with a **PostgreSQL** database, utilizing **Knex.js** as the query builder. The frontend is developed using **React** for a fast and efficient development experience.

## Features

### Backend:

- **Express.js server** for handling API requests
- **PostgreSQL database** for data persistence
- **Knex.js ORM** for database interactions and migrations
- **JWT authentication** for user authentication and security
- **CRUD operations** for managing bikes, customers, and orders
- **RESTful API** endpoints for frontend integration

### Frontend:

- **React ** for a fast and optimized UI
- **React Router** for seamless navigation
- **Axios** for API communication
- **State management** using React Context API

## Tech Stack

### Backend:

- Node.js
- Express.js
- PostgreSQL
- Knex.js
- JSON Web Tokens (JWT)

### Frontend:

- React
- React Router
- Axios

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add a new product 
- `PUT /api/products/:id` - Update product by ID
- `PUT /api/products` - Update all products with parameters in request body

### Categories

- `GET /api/categories` - Get all categories

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order 
- `PATCH /api/orders/:id` - Update order status by ID 
- `PUT /api/orders/:id` - Update order by ID with new status and other parameters
- `GET /api/orders/status/:id` - Get orders with a specific status

### Order Status

- `GET /api/status` - Get all possible order statuses


