import { Router } from "express";

import Auth from "./auth"
import Order from "./order"

const router = Router();

router.use('/auth', Auth);
router.use('/order', Order)

export default router