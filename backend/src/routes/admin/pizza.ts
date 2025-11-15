import { Router } from "express";
import { adminOnly } from "../../middleware/adminOnly";
import { Pizza } from "../../config/db/db";

const router = Router();

// ============================
// CREATE PIZZA VARIANT
// ============================
router.post("/add", adminOnly, async (req, res) => {
  try {
    const { title, description, base, sauce, cheese, veggies, price } = req.body;

    const pizza = await Pizza.create({
      title,
      description,
      base,
      sauce,
      cheese,
      veggies,
      price,
      createdBy: null, // Admin pizza / public pizza
    });

    res.json({ message: "Pizza variant added", pizza });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// UPDATE PIZZA VARIANT
// ============================
router.put("/update/:id", adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await Pizza.findById(id);

    if (!pizza || pizza.createdBy !== null) {
      return res.status(400).json({
        message: "Invalid pizza ID",
      });
    }

    const { title, description, base, sauce, cheese, veggies, price } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (base !== undefined) updateData.base = base || null;
    if (sauce !== undefined) updateData.sauce = sauce || null;
    if (cheese !== undefined) updateData.cheese = cheese || null;
    if (veggies !== undefined) updateData.veggies = veggies || [];
    if (price !== undefined) updateData.price = price;

    const updatedPizza = await Pizza.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("base")
      .populate("sauce")
      .populate("cheese")
      .populate("veggies");

    res.json({
      message: "Pizza updated successfully",
      pizza: updatedPizza,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ============================
// DELETE PIZZA VARIANT
// ============================
router.delete("/delete/:id", adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await Pizza.findById(id);

    if (!pizza || pizza.createdBy !== null) {
      return res.status(400).json({
        message: "Invalid pizza ID",
      });
    }

    await Pizza.findByIdAndDelete(id);

    res.json({ message: "Pizza deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// GET ALL ADMIN PIZZA VARIANTS
// ============================
router.get("/", adminOnly, async (req, res) => {
  try {
    const pizzas = await Pizza.find({ createdBy: null })
      .populate("base")
      .populate("sauce")
      .populate("cheese")
      .populate("veggies");

    res.json({ pizzas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
