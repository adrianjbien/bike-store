
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import HomePage from "./HomePage";
import Products from "./Products";
import SignUp from "./SignUp";
import ProtectedRoute from "./ProtectedRoute";
import CreateProduct from "./CreateProduct";
import Cart from "./Cart.jsx";
import OrderDetails from "./OrderDetails.jsx";
import Orders from "./Orders.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/create-product" element={<CreateProduct />} />


        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
};

export default App;
