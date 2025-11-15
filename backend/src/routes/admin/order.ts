import { Router } from "express";
import { Order } from "../../config/db/db";
import { adminOnly } from "../../middleware/adminOnly";

const router = Router();

router.get("/", adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("orders.pizza");

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/status/:id", adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
