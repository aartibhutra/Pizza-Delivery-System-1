import { Router } from "express";

import Auth from "./auth"
import Ingredient from "./ingredient"
import Order from "./order"
import Pizza from "./pizza"

const router = Router();

router.use('/auth', Auth);
router.use('/ingredient', Ingredient);
router.use('/order', Order);
router.use('/pizza', Pizza);

export default router