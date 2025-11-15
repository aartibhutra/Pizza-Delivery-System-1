import { Router } from "express";
import { customerOnly } from "../../middleware/customerOnly";
import { Order, Pizza } from "../../config/db/db"

const router = Router();

router.get("/", customerOnly, async (req : any, res) => {
  try {
    const userId = req.user.id;

    const pizzas = await Pizza.find({
      $or: [
        { createdBy: null },
        { createdBy: userId }
      ]
    })
    .populate("base sauce cheese veggies createdBy");

    res.json({ pizzas });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/pizza", customerOnly, async (req : any, res) => {
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
      createdBy: req.user.id  
    });

    return res.json({
      message: "Custom pizza created",
      pizza
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", customerOnly, async (req : any, res) => {
  try {

    const userId = req.user.id;
    const { pizzaId, quantity } = req.body;

    let order = await Order.findOne({ userId, status: "Order Recieved" });

    if (!order) {
      order = await Order.create({
        userId,
        orders: [],
        status: "Order Recieved",
        totalprice: 0
      });
    }

    order.orders.push({
      pizza: pizzaId,
      quantity
    });

    await order.save();

    res.json({
      message: "Pizza added to your order",
      order
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", customerOnly, async (req : any, res) => {
  try {
    const userId = req.user.id;
    const { pizzaId, quantity } = req.body;

    const order = await Order.findOne({ userId, status: "Order Recieved" });

    if (!order) {
      return res.status(400).json({ message: "No active order found" });
    }

    const item = order.orders.find((o) => o.pizza.toString() === pizzaId);

    if (!item) {
      return res.status(400).json({ message: "Pizza not found in your order" });
    }

    item.quantity = quantity;

    await order.save();

    res.json({
      message: "Quantity updated",
      order
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/place", customerOnly, async (req : any, res) => {
  try {
    const userId = req.user.id;

    const order = await (await Order.create({ userId, status: "Order Recieved" }))
      .populate("orders.pizza");

    if (!order) {
      return res.status(400).json({ message: "No order to place" });
    }

    let total = 0;

    order.orders.forEach((item : any) => {
      total += item.pizza.price * item.quantity;
    });

    order.totalprice = total;

    await order.save();

    res.json({
      message: "Order placed successfully",
      totalPrice: total,
      order
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/orders", customerOnly, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("orders.pizza")
      .sort({ createdAt: -1 });

    return res.json({ orders });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id", customerOnly, async (req : any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId })
      .populate("orders.pizza");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
