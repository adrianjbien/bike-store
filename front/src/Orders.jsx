import { useEffect, useState} from "react";
import { getOrders, updateOrderStatus, getStatuses } from "./services";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
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
    useEffect(() => {
        if (userRole === "PRACOWNIK") {
            const fetchOrdersAndStatuses = async () => {
                try {
                    const ordersData = await getOrders();
                    const statusesData = await getStatuses();
                    setOrders(ordersData);
                    setStatuses(statusesData);
                    setFilteredOrders(ordersData);
                } catch (err) {
                    console.error("Błąd podczas pobierania zamówień lub statusów:", err);
                }
            };
            fetchOrdersAndStatuses();
        }
    }, [userRole]);
    useEffect(() => {
        filterOrders();
    }, [filterStatus, orders]);
    const filterOrders = () => {
        let filtered = orders;
        if (filterStatus) {
            filtered = filtered.filter(
                (order) => order.order_status_id === parseInt(filterStatus)
            );
        }
        setFilteredOrders(filtered);
    };
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            const updatedOrders = orders.map((order) =>
                order.order_id === id ? { ...order, order_status_id: newStatus } : order
            );
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders);
            window.location.reload();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Wystąpił błąd podczas aktualizacji statusu.";
            const errorDetails = err.response?.data?.details || "";
            alert(`${errorMessage}\n${errorDetails}`);
            console.error("Error updating order status:", err.response?.data || err.message);
        }
    };

    const handleBackToProducts = () => {
        navigate("/products");
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
    const getStatusName = (statusId) => {
        const status = statuses.find((status) => status.status_id === statusId);
        return status ? status.name : "Unknown";
    };
    if (userRole !== "PRACOWNIK") {
        return <div>Access denied</div>;
    }
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between">
                <button onClick={handleBackToProducts} className="btn btn-secondary">
                    Back to Products
                </button>
                <button onClick={handleLogout} className="btn btn-danger">
                    Logout
                </button>
            </div>
            <h1 className="text-center mb-4">List of Orders</h1>
            <div className="mb-3">
                <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {statuses.map((status) => (
                        <option key={status.status_id} value={status.status_id}>
                            {status.name}
                        </option>
                    ))}
                </select>
            </div>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Phone number</th>
                    <th scope="col">Status</th>
                    <th scope="col">Accepted Date</th>
                    <th scope="col">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredOrders.map((order, index) => (
                    <tr key={order.order_id}>
                        <td>{index + 1}</td>
                        <td>{order.user_name}</td>
                        <td>{order.email}</td>
                        <td>{order.telephone_number}</td>
                        <td>{getStatusName(order.order_status_id)}</td>
                        <td>{order.accept_date}</td>
                        <td>
                            <button
                                className="btn btn-danger ms-2"
                                onClick={() => handleUpdateStatus(order.order_id, 2)}
                            >
                                Reject Order
                            </button>
                            <button
                                className="btn btn-warning ms-2"
                                onClick={() => handleUpdateStatus(order.order_id, 3)}
                            >
                                Accept Order
                            </button>
                            <button
                                className="btn btn-success ms-2"
                                onClick={() => handleUpdateStatus(order.order_id, 4)}
                            >
                                Complete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
export default Orders;