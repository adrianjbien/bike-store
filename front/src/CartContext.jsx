import { createContext, useState , useEffect} from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(localStorage.getItem("cart") ?
        JSON.parse(localStorage.getItem("cart")) : []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart)); // Synchronizacja z localStorage
    }, [cart]);

    const addToCart = (product) => {
        const isProductInCart = cart.find((p) => p.product_id === product.product_id);

        if (!isProductInCart) {
            setCart([...cart, {...product, quantity: 1}]);
        }
    };

    const incrementQuantity = (productId) => {
        setCart(
            cart.map((cartItem) =>
                cartItem.product_id === productId
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            )
        );
    };

    const decrementQuantity = (productId) => {
        setCart(
            cart.map((cartItem) =>
                cartItem.product_id === productId
                    ? { ...cartItem, quantity: cartItem.quantity - 1 }
                    : cartItem
            ).filter((cartItem) => cartItem.quantity > 0)
        );
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.unit_cost * item.quantity, 0);
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, clearCart, incrementQuantity, decrementQuantity, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
