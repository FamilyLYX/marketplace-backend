import { Router } from "express";
import {
  handleCreateCheckoutSession,
  handleCreateStripeAccount,
  handleGetAccountOnboardingLink,
  handleStripeWebhookCallback,
} from "./handlers";

const stripeRouter = Router();

stripeRouter.get("/onboarding", handleGetAccountOnboardingLink);

stripeRouter.post("/account", handleCreateStripeAccount);

stripeRouter.post("/checkout", handleCreateCheckoutSession);

stripeRouter.post("/checkout", handleStripeWebhookCallback);

export default stripeRouter;
