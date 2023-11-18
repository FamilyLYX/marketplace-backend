import { ethers } from "ethers";
import { FAMILY_MARKETPLACE_CONTRACT_ADDRESS, FAMILY_MARKETPLACE_PRIVATE_KEY, JSON_RPC_URL } from "../../../config/env";

import abi from "./abi.json";

export default class MarketPlace {

  contract: ethers.Contract;
  
  constructor(pk: string, address: string) {
    const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL)
    const signer = new ethers.Wallet(pk, provider)

    this.contract = new ethers.Contract(address, abi, signer)
  }

  buyLSP8WithFiat = async (lsp8Address: string, buyer: string, tokenId: number) => {
    const tx = await this.contract.functions.buyLSP8WithFiat(lsp8Address, buyer, tokenId)

    await tx.wait()
  }

  registerCallback = async (eventName: "DissolvedFiat" | "ResolvedFiat", cb: Function) => {
    const filter = this.contract.filters[eventName]()

    let blockNumber = await this.contract.provider.getBlockNumber()

    setInterval(async () => {
      const events = await this.contract.queryFilter(filter, blockNumber)

      if(events.length > 0) {
        events.map((event) => cb(event))
      }
    }, 1000)
  }

}

export const marketplace = new MarketPlace(FAMILY_MARKETPLACE_PRIVATE_KEY, FAMILY_MARKETPLACE_CONTRACT_ADDRESS)
