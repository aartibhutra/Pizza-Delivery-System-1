import { Router } from "express";
import { adminOnly } from "../../middleware/adminOnly";
import {
  PizzaBase,
  PizzaSauce,
  PizzaCheese,
  PizzaVeggies,
} from "../../config/db/db";
import nodemailer from "nodemailer";

const router = Router();

// ADD BASE / SAUCE / CHEESE / VEGGIES
router.post("/add", adminOnly, async (req, res) => {
  const { type, name, stock, price, threshold } = req.body;

  try {
    let Model;

    switch (type) {
      case "base":
        Model = PizzaBase;
        break;
      case "sauce":
        Model = PizzaSauce;
        break;
      case "cheese":
        Model = PizzaCheese;
        break;
      case "veggies":
        Model = PizzaVeggies;
        break;
      default:
        return res.status(400).json({ message: "Invalid ingredient type" });
    }

    const item = await Model.create({ name, stock, price, threshold });
    res.json({ message: "Ingredient added", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:type/:id", adminOnly, async (req, res) => {
  const { type, id } = req.params;

  try {
    const models : any = {
      base: PizzaBase,
      sauce: PizzaSauce,
      cheese: PizzaCheese,
      veggies: PizzaVeggies,
    };

    const Model = models[type];
    if (!Model) return res.status(400).json({ message: "Invalid type" });

    await Model.findByIdAndDelete(id);

    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/stock/:type/:id", adminOnly, async (req, res) => {
  const { type, id } = req.params;
  const { stock } = req.body;

  try {
    const map: any = {
      base: PizzaBase,
      sauce: PizzaSauce,
      cheese: PizzaCheese,
      veggies: PizzaVeggies,
    };

    const Model = map[type];
    if (!Model) return res.status(400).json({ message: "Invalid type" });

    const ing = await Model.findByIdAndUpdate(id, { stock });

    if (stock < ing.threshold) {
      const admins = process.env.ADMIN_ALERT_EMAILS?.split(",") || [];

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const htmlContent = `
        <div style="font-family: sans-serif;">
          <h2>⚠ Low Stock Alert</h2>
          <p><strong>${ing.name}</strong> stock has fallen below threshold.</p>
          <p><strong>New Stock:</strong> ${stock}</p>
          <p><strong>Threshold:</strong> ${ing.threshold}</p>
          <p>Please restock as soon as possible.</p>
        </div>
      `;

      for (const email of admins) {
        console.log("asdsa")
        await transporter.sendMail({
          from: "Pizza System",
          to: email.trim(),
          subject: `⚠ Low Stock Alert: ${ing.name}`,
          html: htmlContent,
        });
      }
    }

    res.json({ message: "Stock updated" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/price/:type/:id", adminOnly, async (req, res) => {
  const { type, id } = req.params;
  const { price } = req.body;

  try {
    const models: any = {
      base: PizzaBase,
      sauce: PizzaSauce,
      cheese: PizzaCheese,
      veggies: PizzaVeggies,
    };

    const Model = models[type];
    if (!Model) return res.status(400).json({ message: "Invalid type" });

    await Model.findByIdAndUpdate(id, { price });

    res.json({ message: "Price updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:type", adminOnly, async (req, res) => {
  const { type } = req.params;

  try {
    const models: any = {
      base: PizzaBase,
      sauce: PizzaSauce,
      cheese: PizzaCheese,
      veggies: PizzaVeggies,
    };

    const Model = models[type];
    if (!Model) return res.status(400).json({ message: "Invalid type" });

    const items = await Model.find();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
