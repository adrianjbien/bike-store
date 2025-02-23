import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const Cart = () => {
    const { cart, clearCart, incrementQuantity, decrementQuantity, getCartTotal } = useContext(CartContext);
    const navigate = useNavigate();


    const handleDelete = () => {
        clearCart()
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        clearCart();
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Cart</h1>
            <div className="mb-3 text-end">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/products")}
                >
                    Back to Products
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleDelete}
                >
                    Clear Your Cart
                </button>
                <button className="btn btn-danger ms-2" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            {cart.length > 0 ? (
                <table className="table table-bordered">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price (PLN)</th>
                        <th scope="col">Quantity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cart.map((item, index) => (
                        <tr key={item.product_id}>
                            <th scope="row">{index + 1}</th>
                            <td>{item.name}</td>
                            <td>{item.unit_cost} PLN</td>
                            <td>{item.quantity}
                                <button className="btn btn-success btn-sm ms-2" onClick={() => incrementQuantity(item.product_id)}>
                                    <FontAwesomeIcon icon={faPlus}/>
                                </button>
                                <button className="btn btn-danger btn-sm ms-2" onClick={() => decrementQuantity(item.product_id)}>
                                    <FontAwesomeIcon icon={faMinus}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <div className="alert alert-info text-center">
                    Your cart is empty.
                </div>
            )}

            <div className="text-center mt-4">
                <h3>Total Cart Value: {getCartTotal()} PLN</h3>
            </div>
            <div className="text-center mt-4">
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/order-details")}
                >
                    Place An Order Here
                </button>
            </div>
        </div>
    );
};

export default Cart;
