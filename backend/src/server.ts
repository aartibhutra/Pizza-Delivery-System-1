import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import CustomerRouter from "./routes/customer/index";
import AdminRouter from "./routes/admin/index";

dotenv.config();

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/customer", CustomerRouter);
app.use("/api/admin", AdminRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

mongoose
  .connect(process.env.DATABASE_URL || "")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.error(e);
  });
