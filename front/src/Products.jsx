import { useEffect, useState, useContext } from "react";
import {
  getProducts,
  getCategories,
  deleteProduct,
  updateProduct,
  initDatabase,
} from "./services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { useNavigate } from "react-router-dom"; // Import useNavigate do przekierowania
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import { CartContext } from "./CartContext.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const { clearCart, addToCart } = useContext(CartContext);
  const [editedValues, setEditedValues] = useState({
    name: "",
    description: "",
    unit_cost: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let decodedToken = null;
  let userRole = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token); // Dekodowanie tokena JWT
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const fetchProductsAndCategories = async () => {
    try {
      const productsData = await getProducts();
      const categoriesData = await getCategories();
      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error("Błąd podczas pobierania produktów lub kategorii:", err);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filterName, filterCategory, products]);

  const filterProducts = () => {
    let filtered = products;

    if (filterName) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterCategory) {
      const selectedCategory = categories.find(
        (category) => category.name === filterCategory
      );
      if (selectedCategory) {
        filtered = filtered.filter(
          (product) =>
            Number(product.product_category_id) ===
            Number(selectedCategory.category_id)
        );
      }
    }

    setFilteredProducts(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearCart();
    navigate("/");
  };

  const handleAddProduct = () => {
    navigate("/create-product");
  };

  const handleOrders = () => {
    navigate("/orders");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      const updatedProducts = products.filter(
        (product) => product.product_id !== id
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditedValues({
      name: product.name,
      description: product.description,
      unit_cost: product.unit_cost,
    });
  };

  const handleSaveChanges = async () => {
    try {
      await updateProduct(editingProduct.product_id, editedValues);
      const updatedProducts = products.map((product) =>
        product.product_id === editingProduct.product_id
          ? { ...product, ...editedValues }
          : product
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setEditingProduct(null); // Zamknij modal
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleInitDatabase = async () => {
    try {
      if (!selectedFile) {
        alert("Please select a file to initialize the database.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target.result;
        const jsonData = JSON.parse(fileContent);
        console.log("JSON data:", jsonData);
        await initDatabase(jsonData);
        alert("Database initialized successfully");
        fetchProductsAndCategories();
      };
      reader.readAsText(selectedFile);
    } catch (err) {
      console.error("Error initializing database:", err);
      alert("Failed to initialize database");
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end">
        {userRole === "PRACOWNIK" && (
          <>
            <button onClick={handleOrders} className="btn btn-info">
              Orders
            </button>
            <button onClick={openModal} className="btn btn-warning">
              Init Database
            </button>
          </>
        )}
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
        {userRole === "KLIENT" && (
          <button className="btn btn-primary" onClick={() => handleCart()}>
            Your Cart
          </button>
        )}
      </div>
      <h1 className="text-center mb-4">List of products</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filter by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      {userRole === "PRACOWNIK" ? (
        <div>
          <button className="btn btn-success mb-3" onClick={handleAddProduct}>
            Add New Product
          </button>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Nr.</th>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Price (PLN)</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.product_id}>
                  <th scope="row">{index + 1}</th>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.unit_cost} PLN</td>
                  <td>
                    <button
                      className="btn btn-warning ms-2"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => handleDeleteProduct(product.product_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal widoczny tylko dla pracownika */}
          {editingProduct && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Product</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setEditingProduct(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editedValues.name}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editedValues.description}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price (PLN)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editedValues.unit_cost}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            unit_cost: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveChanges}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Nr.</th>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Price (PLN)</th>
                <th scope="col">Buy</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.product_id}>
                  <th scope="row">{index + 1}</th>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.unit_cost} PLN</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(product)}
                    >
                      <FontAwesomeIcon icon={faCartShopping} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* Modal */}
      <div
        className={`modal ${showModal ? "d-block" : "d-none"}`}
        tabIndex="-1"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Initialize Database</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="file"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleInitDatabase}
              >
                Initialize
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
