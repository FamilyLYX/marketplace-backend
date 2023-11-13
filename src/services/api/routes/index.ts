import { Router } from "express";
import stripeRouter from "./stripe";

const router = Router()

router.use('/stripe', stripeRouter);

export default router

