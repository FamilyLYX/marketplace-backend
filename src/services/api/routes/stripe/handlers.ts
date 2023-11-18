import { RequestHandler } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../../utils/response.utils";
import { stripeService } from "../../../stripe";
import { marketplace } from "../../../../utils/web3/marketplace";

export const handleCreateStripeAccount: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    const stripeAccount = await stripeService.createExpressAccount();

    // save account id to the db under users account

    return sendSuccessResponse(res, { userId, account: stripeAccount.id });
  } catch (err: any) {
    return sendErrorResponse(res, new Error(err.message));
  }
};

export const handleGetAccountOnboardingLink: RequestHandler = async (
  req,
  res,
) => {
  try {
    // retrieve user's id from the db
    const { userId } = req.body;

    const accountLink = await stripeService.createAccountOnboardingLink(
      userId,
    );

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
    const { sellerAccountId, price } = req.body;

    const checkoutSession = await stripeService.createCheckoutSession(
      sellerAccountId,
      price,
    );

    if (!checkoutSession.url) {
      return sendErrorResponse(
        res,
        new Error("Checkout session creation failed"),
      );
    }

    return sendSuccessResponse(res, { url: checkoutSession.url });
  } catch (err: any) {
    return sendErrorResponse(res, new Error(err.message));
  }
};

export const handleStripeWebhookCallback: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    const signature = req.headers["stripe-signature"] ?? "";

    const { type, id } = await stripeService.verifySignatureAndGetEvent(
      event,
      signature,
    );

    if (type === "payment_intent.succeeded") {
      console.log(`--payment recieved for id ${id}`);

      // TODO: Retrieve buyer and seller using the payment intent id and call butWithFiat function on the smart contract
      
      await marketplace.buyLSP8WithFiat("", "", 0);
      
      return sendSuccessResponse(res, { success: true });
    }
  } catch (err: any) {
    return sendErrorResponse(res, new Error(err.message));
  }
};
