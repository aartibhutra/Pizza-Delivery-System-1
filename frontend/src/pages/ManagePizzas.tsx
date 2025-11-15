import { useEffect, useState } from "react";
import axios from "axios";

interface Ingredient {
  _id: string;
  name: string;
  price: number;
}

interface Pizza {
  _id: string;
  title: string;
  description?: string;
  base: string | null;
  sauce: string | null;
  cheese: string | null;
  veggies: string[];
  price: number;
}

export default function ManagePizzas() {
  const token = localStorage.getItem("admin_token") || "";
  const api = import.meta.env.VITE_BACKEND_URL;

  const headers = { Authorization: `Bearer ${token}` };

  // Ingredient lists
  const [bases, setBases] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Ingredient[]>([]);
  const [cheeses, setCheeses] = useState<Ingredient[]>([]);
  const [veggies, setVeggies] = useState<Ingredient[]>([]);

  // Pizza variants list
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [baseId, setBaseId] = useState<string>("");
  const [sauceId, setSauceId] = useState<string>("");
  const [cheeseId, setCheeseId] = useState<string>("");
  const [veggieIds, setVeggieIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);

  // Fetch all ingredient types
  const fetchIngredients = async () => {
    try {
      const [b, s, c, v] = await Promise.all([
        axios.get(`${api}/admin/ingredient/base`, { headers }),
        axios.get(`${api}/admin/ingredient/sauce`, { headers }),
        axios.get(`${api}/admin/ingredient/cheese`, { headers }),
        axios.get(`${api}/admin/ingredient/veggies`, { headers }),
      ]);

      setBases(b.data.items);
      setSauces(s.data.items);
      setCheeses(c.data.items);
      setVeggies(v.data.items);
    } catch (err) {
      console.error("Error fetching ingredients:", err);
    }
  };

  // Fetch all pizza variants
  const fetchPizzas = async () => {
    try {
      const res = await axios.get(`${api}/admin/pizza`, { headers });
      setPizzas(res.data.pizzas);
    } catch (err) {
      console.error("Error fetching pizzas:", err);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchPizzas();
  }, []);

  // Create a new pizza
  const createPizza = async () => {
    if (!title || price <= 0) {
      alert("Title and price are required");
      return;
    }

    try {
      await axios.post(
        `${api}/admin/pizza/add`,
        {
          title,
          description,
          base: baseId || null,
          sauce: sauceId || null,
          cheese: cheeseId || null,
          veggies: veggieIds,
          price,
        },
        { headers }
      );

      // Reset form
      setTitle("");
      setDescription("");
      setBaseId("");
      setSauceId("");
      setCheeseId("");
      setVeggieIds([]);
      setPrice(0);

      fetchPizzas();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create pizza");
    }
  };

  // Update pizza price
  const updatePrice = async (id: string, newPrice: number) => {
    try {
      await axios.put(
        `${api}/admin/pizza/update/${id}`,
        { price: newPrice },
        { headers }
      );
      fetchPizzas();
    } catch (err) {
      console.error("Update price error:", err);
      alert("Failed to update price");
    }
  };

  // Delete pizza
  const deletePizza = async (id: string) => {
    if (!confirm("Delete this pizza variant?")) return;

    try {
      await axios.delete(`${api}/admin/pizza/delete/${id}`, { headers });
      fetchPizzas();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Manage Pizza Variants</h1>

      {/* CREATE FORM */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Create New Pizza</h2>

        <div className="grid grid-cols-2 gap-4">

          {/* Title */}
          <input
            type="text"
            placeholder="Pizza Name"
            className="p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Price ₹"
            className="p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            className="col-span-2 p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Base */}
          <select
            className="p-2 border rounded"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
          >
            <option value="">None</option>
            {bases.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          {/* Sauce */}
          <select
            className="p-2 border rounded"
            value={sauceId}
            onChange={(e) => setSauceId(e.target.value)}
          >
            <option value="">None</option>
            {sauces.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          {/* Cheese */}
          <select
            className="p-2 border rounded"
            value={cheeseId}
            onChange={(e) => setCheeseId(e.target.value)}
          >
            <option value="">None</option>
            {cheeses.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Veggies */}
          <select
            multiple
            className="p-2 border rounded h-32"
            value={veggieIds}
            onChange={(e) =>
              setVeggieIds(Array.from(e.target.selectedOptions, opt => opt.value))
            }
          >
            <option value="">None</option>
            {veggies.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={createPizza}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Pizza
        </button>
      </div>

      {/* ALL PIZZAS TABLE */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-medium mb-3">Pizza Variants</h2>

        {pizzas.length === 0 ? (
          <p>No pizzas found</p>
        ) : (
          <table className="w-full border text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">Title</th>
                <th className="p-2">Price</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pizzas.map((pizza) => (
                <tr key={pizza._id} className="border-b">
                  <td className="p-2">{pizza.title}</td>

                  <td className="p-2">
                    <input
                      type="number"
                      defaultValue={pizza.price}
                      onBlur={(e) => updatePrice(pizza._id, Number(e.target.value))}
                      className="p-1 border rounded w-20"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => deletePizza(pizza._id)}
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
