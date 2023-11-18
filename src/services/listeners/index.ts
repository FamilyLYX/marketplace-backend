import { ethers } from "ethers";
import { stripeService } from "../stripe";

export const handleResolvedFiatTrade = async (event: ethers.Event) => {
  const tradeId = event.args?.tradId;

  if (!tradeId) return;

  try {
    // TODO: Get seller account id using the tradId variable
    const seller = "";
    const amount = 100;

    await stripeService.payoutUserFunds(seller, amount);
  } catch (err: any) {
    console.log(`--err paying out trade ${tradeId}`);
  }
};
