import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Ingredient {
  _id: string;
  name: string;
  price: number;
}

export default function CreatePizza() {
  const navigate = useNavigate();

  const [bases, setBases] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Ingredient[]>([]);
  const [cheeses, setCheeses] = useState<Ingredient[]>([]);
  const [veggies, setVeggies] = useState<Ingredient[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [baseId, setBaseId] = useState("");
  const [sauceId, setSauceId] = useState("");
  const [cheeseId, setCheeseId] = useState("");
  const [veggieIds, setVeggieIds] = useState<string[]>([]);

  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const api = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("customer_token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all pizzas so ingredients can be extracted
  const loadIngredients = async () => {
    try {
      const res = await axios.get(`${api}/customer/order`, { headers });

      const pizzas = res.data.pizzas || [];

      setBases(extractUnique(pizzas.map((p: any) => p.base)));
      setSauces(extractUnique(pizzas.map((p: any) => p.sauce)));
      setCheeses(extractUnique(pizzas.map((p: any) => p.cheese)));

      const vegList = pizzas.flatMap((p: any) => p.veggies || []);
      setVeggies(extractUnique(vegList));
    } catch (err) {
      console.error(err);
    }
  };

  // Utility - remove duplicates + null
  const extractUnique = (items: any[]) => {
    const map = new Map();
    items.forEach((item) => {
      if (item && item._id) map.set(item._id, item);
    });
    return Array.from(map.values());
  };

  // Calculate total pizza price
  const calcPrice = () => {
    let total = 0;

    if (baseId) total += bases.find((b) => b._id === baseId)?.price || 0;
    if (sauceId) total += sauces.find((s) => s._id === sauceId)?.price || 0;
    if (cheeseId) total += cheeses.find((c) => c._id === cheeseId)?.price || 0;

    veggieIds.forEach((vid) => {
      total += veggies.find((v) => v._id === vid)?.price || 0;
    });

    setPrice(total);
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    calcPrice();
  }, [baseId, sauceId, cheeseId, veggieIds]);

  // Submit custom pizza
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${api}/customer/order/pizza`,
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

      alert("Custom pizza created!");
      navigate("/customer/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to create pizza.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">Create Custom Pizza</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Pizza Name</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Base */}
        <div>
          <label className="block mb-1 font-medium">Choose Base</label>
          <select
            className="p-2 border rounded w-full"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
          >
            <option value="">None</option>
            {bases.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} (+₹{b.price})
              </option>
            ))}
          </select>
        </div>

        {/* Sauce */}
        <div>
          <label className="block mb-1 font-medium">Choose Sauce</label>
          <select
            className="p-2 border rounded w-full"
            value={sauceId}
            onChange={(e) => setSauceId(e.target.value)}
          >
            <option value="">None</option>
            {sauces.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} (+₹{s.price})
              </option>
            ))}
          </select>
        </div>

        {/* Cheese */}
        <div>
          <label className="block mb-1 font-medium">Choose Cheese</label>
          <select
            className="p-2 border rounded w-full"
            value={cheeseId}
            onChange={(e) => setCheeseId(e.target.value)}
          >
            <option value="">None</option>
            {cheeses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} (+₹{c.price})
              </option>
            ))}
          </select>
        </div>

        {/* Veggies */}
        <div>
          <label className="block mb-1 font-medium">Choose Veggies</label>
          <select
            className="p-2 border rounded w-full"
            multiple
            value={veggieIds}
            onChange={(e) =>
              setVeggieIds(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
          >
            <option value="">None</option>
            {veggies.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} (+₹{v.price})
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="bg-gray-100 p-3 rounded border text-lg font-medium">
          Total Price: ₹{price}
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Pizza"}
        </button>

      </form>
    </div>
  );
}
