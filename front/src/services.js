import api from "./api";

// Funkcja logowania
export const login = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  localStorage.setItem("token", response.data.token); // Zapisz token
  return response.data;
};

export const registerUser = async (username, password) => {
  const response = await api.post("/auth/register", { username, password });
  return response.data;
};

// Pobierz produkty
export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

// Dodaj nowy produkt (tylko dla PRACOWNIKÓW)
export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Pobierz zamówienia
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// Pobierz kategorie
export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}`, { order_status_id: status });
  return response.data;
};
export const getStatuses = async () => {
  const response = await api.get("/status");
  return response.data;
};
export const getOrdersStatus = async (id) => {
  const response = await api.get(`/orders/status/${id}`);
  return response.data;
};

export const initDatabase = async (data) => {
  const response = await api.post("/init", data);
  return response.data;
};
