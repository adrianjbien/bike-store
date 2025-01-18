const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const db = require("./queries");
const cors = require("cors");
const port = 3000;
const { authenticateToken, checkRole } = require("./auth-middleware");
const StatusCodes = require("http-status-codes");

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});
app.get(
  "/categories",
  authenticateToken,
  checkRole(["KLIENT", "PRACOWNIK"]),
  db.getCategories
);
app.get(
  "/products",
  authenticateToken,
  checkRole(["KLIENT", "PRACOWNIK"]),
  db.getProducts
);
app.get(
  "/products/:id",
  authenticateToken,
  checkRole(["KLIENT", "PRACOWNIK"]),
  db.getProductById
);
app.post(
  "/products",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.createProduct
);
app.put(
  "/products/:id",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.updateProduct
);
app.get(
  "/products/:id/seo-description",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.getProductSeoDescription
);
app.get(
  "/orders",
  authenticateToken,
  checkRole(["KLIENT", "PRACOWNIK"]),
  db.getOrders
);
app.post("/orders", authenticateToken, checkRole(["KLIENT"]), db.createOrder);
app.get(
  "/orders/status/:id",
  authenticateToken,
  checkRole(["KLIENT", "PRACOWNIK"]),
  db.getOrdersStatus
);

app.get("/status", authenticateToken, checkRole(["PRACOWNIK"]), db.getStatus);
app.put(
  "/orders/:id",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.updateOrderStatus
);
app.get(
  "/order/:id/products",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.showProductsInOrder
);
app.delete(
  "/products/:id",
  authenticateToken,
  checkRole(["PRACOWNIK"]),
  db.deleteProduct
);
app.post("/auth/login", db.login);
app.post("/auth/register", db.registerUser);
app.post("/auth/refresh-token", db.refreshToken);

app.post("/init", authenticateToken, checkRole(["PRACOWNIK"]), db.initDatabase);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
