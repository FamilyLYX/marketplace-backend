import { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY } from '../../config/env';

import Stripe from 'stripe';

class StripeService {
	stripe: Stripe;
	publicKey: string;

	constructor(publicKey: string, secretKey: string) {
		this.stripe = new Stripe(secretKey);
		this.publicKey = publicKey;
	}

	/**
	 * Creates a external account with automatic payouts disabled so it can act as an escrow
	 * @returns {Stripe.Account}
	 */
	createExpressAccount = async () => {
		return await this.stripe.accounts.create({
			type: 'express',
			country: 'AUSTRALIA',
			settings: {
				payouts: {
					schedule: {
						interval: 'manual',
					},
				},
			},
		});
	};

	/**
	 * Puts together a stripe onboarding link to share with the user to have him setup his stripe account details
	 * @param {string} accountId Id of the stripe connected account to generate the onboarding link for
	 * @returns {Stripe.AccountLink} Contains the url to be shared with the user
	 */
	createAccountOnboardingLink = async (accountId: string) => {
		return await this.stripe.accountLinks.create({
			type: 'account_onboarding',
			account: accountId,
			refresh_url: `${process.env.NODE_ENV === 'production' ? process.env.DEPLOYMENT_URL : 'http://localhost:3000'}/stripe/onboarding/refresh`,
			return_url: `${process.env.NODE_ENV === 'production' ? process.env.DEPLOYMENT_URL : 'http://localhost:3000'}/stripe/onboarding/return`,
		});
	};

	createCheckoutSession = async (sellerAccountId: string, price: number) => {
		return await this.stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: [
				{
					price: price.toString(),
					quantity: 1,
				},
			],
			payment_intent_data: {
				application_fee_amount: 0,
				transfer_data: {
					destination: sellerAccountId,
				},
			},
			success_url: `${process.env.NODE_ENV === 'production' ? process.env.DEPLOYMENT_URL : 'http://localhost:3000'}/stripe/checkout/success`,
			cancel_url: `${process.env.NODE_ENV === 'production' ? process.env.DEPLOYMENT_URL : 'http://localhost:3000'}/stripe/checkout/cancel`,
		});
	};

	payoutUserFunds = async (accountId: string, amount: number) => {
		return await this.stripe.payouts.create(
			{
				amount,
				currency: 'usd',
			},
			{
				stripeAccount: accountId,
			}
		);
	};
}

export const stripeService = new StripeService(STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY);
