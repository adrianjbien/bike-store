import {useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "./services";
import {CartContext} from "./CartContext.jsx";

const OrderDetails = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const { cart } = useContext(CartContext)

    const handleOrderSubmit = async () => {
            // Przygotowanie danych do zapytania
            const orderData = {
                user_name: username,
                email: email,
                telephone_number: phone,
                accept_date: null,
                order_status_id: 1,
                products: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })), // Przekształcenie koszyka na format API
            };

            try {
                await createOrder(orderData);

                alert("The order was successfully placed!");
                navigate("/products"); // Przekierowanie po złożeniu zamówienia
            } catch (err) {
                const errorMessage = err.response?.data?.error || "Error creating order.";
                const errorDetails = err.response?.data?.details || "";
                alert(`${errorMessage}\n${errorDetails}`);
            }
        }


    return (
        <div className="container mt-5">
            <button className="btn btn-secondary" onClick={() => navigate("/cart")}>
                Back to cart
            </button>
            <div className="mb-3">
                <label className="form-label">Name and Surname</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name and surname"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                />
            </div>
            <button className="btn btn-primary" onClick={handleOrderSubmit}>
                Submit
            </button>

        </div>
    );
};

export default OrderDetails;
