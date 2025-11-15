import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalOrders = orders.length;
  const ongoingOrders = orders.filter((o : any) => o.status !== "Delivered");
  const pendingDeliveries = ongoingOrders.length;

  const totalPizzas = orders.reduce((sum, order : any) => {
    return sum + order.orders.reduce((sub : any, item : any) => sub + item.quantity, 0);
  }, 0);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const name = localStorage.getItem("admin_name");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setAdminName(name || "Admin");

    fetchOrders(token);
  }, []);

  const fetchOrders = async (token : any) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md p-5 flex flex-col">
        <h2 className="text-xl font-semibold mb-8">Admin Panel</h2>

        <div className="space-y-4">
          <button onClick={() => navigate("/admin/dashboard")} className="w-full text-left p-2 rounded hover:bg-gray-200">Dashboard Home</button>
          <button onClick={() => navigate("/admin/manage/bases")} className="w-full text-left p-2 rounded hover:bg-gray-200">Manage Bases</button>
          <button onClick={() => navigate("/admin/manage/sauces")} className="w-full text-left p-2 rounded hover:bg-gray-200">Manage Sauces</button>
          <button onClick={() => navigate("/admin/manage/cheese")} className="w-full text-left p-2 rounded hover:bg-gray-200">Manage Cheese</button>
          <button onClick={() => navigate("/admin/manage/veggies")} className="w-full text-left p-2 rounded hover:bg-gray-200">Manage Veggies</button>
          <button onClick={() => navigate("/admin/manage/pizzas")} className="w-full text-left p-2 rounded hover:bg-gray-200">Manage Pizza Variants</button>
          <button onClick={() => navigate("/admin/orders")} className="w-full text-left p-2 rounded hover:bg-gray-200">Orders</button>
        </div>

        <div className="mt-auto pt-5">
          <button onClick={handleLogout} className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome, {adminName}</h1>
        </div>

        {loading ? (
          <div className="text-center mt-20">Loading orders...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Total Orders</h3>
                <p className="text-3xl mt-2 font-bold">{totalOrders}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Total Pizzas Sold</h3>
                <p className="text-3xl mt-2 font-bold">{totalPizzas}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Pending Deliveries</h3>
                <p className="text-3xl mt-2 font-bold">{pendingDeliveries}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">Ongoing Orders</h2>

              {ongoingOrders.length === 0 ? (
                <p className="text-gray-500">No ongoing orders right now.</p>
              ) : (
                <table className="w-full text-left border">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Total Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ongoingOrders.map((ord : any) => (
                      <tr key={ord._id} className="border-b">
                        <td className="p-2">{ord._id}</td>
                        <td className="p-2">{ord.userId?.name}</td>
                        <td className="p-2 font-medium">{ord.status}</td>
                        <td className="p-2">₹{ord.totalprice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
