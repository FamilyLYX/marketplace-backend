import { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY } from "../../config/env";

import Stripe from "stripe";

class StripeService {

  stripe: Stripe;
  publicKey: string;
  
  constructor(publicKey: string, secretKey: string) {
    this.stripe = new Stripe(secretKey)    
    this.publicKey = publicKey;
  }

  createExpressAccount = async () => {
    return await this.stripe.accounts.create({
      type: "express",
      country: "AUSTRALIA",
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          }
        }
      }
    })
  }

  createAccountOnboardingLink = async (accountId: string) => {
    return await this.stripe.accountLinks.create({
      type: "account_onboarding",
      account: accountId
    })
  }

}

export const stripeService = new StripeService(STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY)
