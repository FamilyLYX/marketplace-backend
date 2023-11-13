import { Router } from 'express';
import { handleCreateCheckoutSession, handleCreateStripeAccount, handleGetAccountOnboardingLink } from './handlers';

const stripeRouter = Router();

stripeRouter.get('/onboarding', handleGetAccountOnboardingLink);

stripeRouter.post('/account', handleCreateStripeAccount);

stripeRouter.post('/checkout', handleCreateCheckoutSession);

export default stripeRouter;
