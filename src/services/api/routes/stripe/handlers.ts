import { RequestHandler } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../../../../utils/response.utils';
import { stripeService } from '../../../stripe';

export const handleCreateStripeAccount: RequestHandler = async (req, res) => {
	try {
		const stripeAccount = await stripeService.createExpressAccount();

		// save account id to the db under users account

		return sendSuccessResponse(res, { success: true });
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};

export const handleGetAccountOnboardingLink: RequestHandler = async (req, res) => {
	try {
		// retrieve user's id from the db
		const accountId = '';

		const accountLink = await stripeService.createAccountOnboardingLink(accountId);

		return sendSuccessResponse(res, { url: accountLink.url, expiresAt: accountLink.expires_at });
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};

export const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
	try {
		const { sellerAccountId, price } = req.body;

		const checkoutSession = await stripeService.createCheckoutSession(sellerAccountId, price);

		if (!checkoutSession.url) return sendErrorResponse(res, new Error('Checkout session creation failed'));

		return sendSuccessResponse(res, { url: checkoutSession.url });
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};
