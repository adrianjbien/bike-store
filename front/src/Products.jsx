import React, { useEffect, useState } from "react";
import { getProducts } from "./services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Błąd podczas pobierania produktów:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">List of products</h1>
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
          {products.map((product, index) => (
            <tr key={product.id}>
              <th scope="row">{index + 1}</th>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.unit_cost} PLN</td>
              <td>
                <button className="btn btn-primary">
                  <FontAwesomeIcon icon={faCartShopping} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
