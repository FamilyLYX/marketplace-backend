import { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_ENDPOINT_SECRET } from '../../config/env';

import Stripe from 'stripe';

class StripeService {
	stripe: Stripe;
	publicKey: string;

	constructor(publicKey: string, secretKey: string) {
		this.stripe = new Stripe(secretKey);
		this.publicKey = publicKey;
	}

	createExpressAccount = async () => {
		return await this.stripe.accounts.create({
			type: 'express',
			country: 'AU',
			settings: {
				payouts: {
					schedule: {
						interval: 'manual',
					},
				},
			},
		});
	};

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

	verifySignatureAndGetEvent = async (event: string | Buffer, signature: string | Buffer | string[]) => {
		// Get the signature sent by Stripe
		try {
			const constructedEvent = this.stripe.webhooks.constructEvent(event, signature, STRIPE_WEBHOOK_ENDPOINT_SECRET);

			return { type: constructedEvent.type, id: constructedEvent.id };
		} catch (err: any) {
			throw new Error(`⚠️  Webhook signature verification failed. ${err.message}`);
		}
	};
}

export const stripeService = new StripeService(STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY);
