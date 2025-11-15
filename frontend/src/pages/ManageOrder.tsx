import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  mail: string;
}

interface Pizza {
  _id: string;
  title: string;
}

interface OrderItem {
  pizza: Pizza;
  quantity: number;
}

interface Order {
  _id: string;
  userId: User;
  status: string;
  orders: OrderItem[];
  totalprice: number;
  createdAt?: string;
}

export default function ManageOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const api = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("admin_token");

  const headers = { Authorization: `Bearer ${token}` };

  const statusOptions = [
    "Order Recieved",
    "In the Kitchen",
    "Sent to Delivery",
    "Delivered",
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${api}/admin/order`, { headers });
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(
        `${api}/admin/order/status/${id}`,
        { status: newStatus },
        { headers }
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Manage Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-lg shadow border"
            >
              {/* Header */}
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-medium">
                  Order ID: {order._id.slice(-6).toUpperCase()}
                </h2>

                <span className="text-gray-500 text-sm">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>

              {/* Customer */}
              <p className="mb-2">
                <strong>Customer:</strong> {order.userId?.name} (
                {order.userId?.mail})
              </p>

              {/* Order Items */}
              <div className="border rounded p-3 bg-gray-50 mb-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="space-y-1">
                  {order.orders.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {item.pizza?.title || "Deleted Pizza"} ×{" "}
                        {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total Price */}
              <p className="mb-4">
                <strong>Total Price:</strong> ₹{order.totalprice}
              </p>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Status:</label>
                <select
                  className="p-2 border rounded"
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
