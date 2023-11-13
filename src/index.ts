import dotenv from "dotenv";
dotenv.config();

import { apiService } from "./services/api";

async function main() {
  apiService.init()
}

main().catch(err => console.error(err))
