import { Router } from 'express';
import { handleCreateCheckoutSession, handleCreateStripeAccount, handleGetAccountOnboardingLink, handleStripeWebhookCallback } from './handlers';

const stripeRouter = Router();

stripeRouter.post('/onboarding', handleGetAccountOnboardingLink);

stripeRouter.post('/account', handleCreateStripeAccount);

stripeRouter.post('/checkout', handleCreateCheckoutSession);

stripeRouter.post('/webhook', handleStripeWebhookCallback);

export default stripeRouter;
