import { Router } from "express";
import { handleCreateStripeAccount, handleGetAccountOnboardingLink } from "./handlers";

const stripeRouter = Router()

stripeRouter.get('/onboarding', handleGetAccountOnboardingLink)

stripeRouter.post('/account', handleCreateStripeAccount)

export default stripeRouter;
