import { useEffect, useState } from "react";
import axios from "axios";

export default function IngredientManager({ title, type } : any) {
  const token = localStorage.getItem("admin_token");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("");
  const [price, setPrice] = useState("");

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/ingredient/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async () => {
    if (!name || !price) return alert("Name & price required");

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/ingredient/add`,
        { type, name, stock, threshold, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setStock("");
      setThreshold("");
      setPrice("");

      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStock = async (id :string, value : string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/ingredient/stock/${type}/${id}`,
        { stock: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePrice = async (id : string, value : string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/ingredient/price/${type}/${id}`,
        { price: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id : string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/admin/ingredient/${type}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>

      <h1 className="text-2xl font-semibold mb-6">{title}</h1>

      {/* ADD FORM */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Add New {title}</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price"
            className="p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Stock"
            className="p-2 border rounded"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <input
            type="number"
            placeholder="Threshold"
            className="p-2 border rounded"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>

        <button
          onClick={addItem}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-3">All {title}</h2>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Threshold</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item : any) => (
                <tr key={item._id} className="border-b">
                  <td className="p-2">{item.name}</td>

                  <td className="p-2">
                    <input
                      type="number"
                      defaultValue={item.price}
                      onBlur={(e) => updatePrice(item._id, e.target.value)}
                      className="p-1 border rounded w-20"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      defaultValue={item.stock}
                      onBlur={(e) => updateStock(item._id, e.target.value)}
                      className="p-1 border rounded w-20"
                    />
                  </td>

                  <td className="p-2">{item.threshold}</td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
