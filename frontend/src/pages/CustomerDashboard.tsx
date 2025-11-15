import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Ingredient {
  _id: string;
  name: string;
}

interface Pizza {
  _id: string;
  title: string;
  description: string;
  price: number;
}

interface CartItem {
  pizza: Pizza;
  quantity: number;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const api = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("customer_token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch pizzas
  const loadPizzas = async () => {
    try {
      const res = await axios.get(`${api}/customer/order`, { headers });
      setPizzas(res.data.pizzas || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPizzas();
  }, []);

  // Add to cart (local state)
  const addToCart = (pizza: Pizza) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.pizza._id === pizza._id);

      if (existing) {
        return prev.map((item) =>
          item.pizza._id === pizza._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { pizza, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (pizzaId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.pizza._id === pizzaId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Place Order (final call)
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const payload = {
      items: cart.map((item) => ({
        pizzaId: item.pizza._id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await axios.post(
        `${api}/customer/order/place`,
        payload,
        { headers }
      );

      alert("Order placed!");
      setCart([]);

    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Customer Dashboard</h1>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/customer/create-pizza")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Custom Pizza
        </button>

        <button
          onClick={() => window.scrollTo(0, document.body.scrollHeight)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
        >
          🛒 View Cart
        </button>
      </div>

      {/* Pizza List */}
      <h2 className="text-xl font-semibold mb-4">Available Pizzas</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pizzas.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-medium">{p.title}</h3>
            <p className="text-gray-600 mb-2">{p.description}</p>
            <p className="font-medium">₹{p.price}</p>

            <button
              onClick={() => addToCart(p)}
              className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* CART SECTION */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.pizza._id}
                className="flex justify-between items-center border p-3 rounded mb-3"
              >
                <div>
                  <p className="font-medium">{item.pizza.title}</p>
                  <p className="text-sm text-gray-500">
                    ₹{item.pizza.price} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 bg-gray-300 rounded"
                    onClick={() => updateQuantity(item.pizza._id, -1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    className="px-3 py-1 bg-gray-300 rounded"
                    onClick={() => updateQuantity(item.pizza._id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-gray-100 p-4 rounded mt-4">
              <h3 className="text-lg font-medium">
                Total: ₹
                {cart.reduce(
                  (acc, curr) => acc + curr.pizza.price * curr.quantity,
                  0
                )}
              </h3>
            </div>

            <button
              onClick={placeOrder}
              className="mt-6 w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Place Order
            </button>
          </>
        )}

        <button
          onClick={() => navigate("/customer/orders")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          📦 My Orders
        </button>
      </div>
    </div>
  );
}
