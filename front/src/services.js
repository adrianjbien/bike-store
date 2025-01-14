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
