import { RequestHandler } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../../../../utils/response.utils';
import { stripeService } from '../../../stripe';
import { marketplace } from '../../../../utils/web3/marketplace';
import { firebase } from '../../../firebase';

export const handleCreateStripeAccount: RequestHandler = async (req, res) => {
	try {
		const { token } = req.body;

		const uid = await firebase.authenticateUserFromToken(token);

		const stripeAccount = await stripeService.createExpressAccount();

		await firebase.saveStripeAccountIdToDb(uid, stripeAccount.id);

		return sendSuccessResponse(res, { uid, account: stripeAccount.id });
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};

export const handleGetAccountOnboardingLink: RequestHandler = async (req, res) => {
	try {
		const { token } = req.body;

		const userId = await firebase.authenticateUserFromToken(token);

		const accountId = await firebase.getStripeAccountId(userId);

		const accountLink = await stripeService.createAccountOnboardingLink(accountId);

		return sendSuccessResponse(res, {
			url: accountLink.url,
			expiresAt: accountLink.expires_at,
		});
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};

export const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
	try {
		const { buyer, lsp8Addess, lsp8Id, sellerAccountId, price } = req.body;

		const checkoutSession = await stripeService.createCheckoutSession(sellerAccountId, price);

		if (!checkoutSession.url) {
			return sendErrorResponse(res, new Error('Checkout session creation failed'));
		}

		await firebase.createCheckoutSession(lsp8Addess, sellerAccountId, checkoutSession.id, buyer, lsp8Id);

		return sendSuccessResponse(res, { url: checkoutSession.url });
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};

export const handleStripeWebhookCallback: RequestHandler = async (req, res) => {
	try {
		const event = req.body;

		const signature = req.headers['stripe-signature'] ?? '';

		const { type, id } = await stripeService.verifySignatureAndGetEvent(event, signature);

		if (type === 'payment_intent.succeeded') {
			console.log(`--payment recieved for id ${id}`);

			const [checkout] = await firebase.getCheckoutDetails(id);

			await marketplace.buyLSP8WithFiat(checkout.lsp8Addess, checkout.buyer, checkout.lsp8Id);

			return sendSuccessResponse(res, { success: true });
		}
	} catch (err: any) {
		return sendErrorResponse(res, new Error(err.message));
	}
};
