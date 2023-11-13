import express from "express";
import { PORT } from "../../config/env";
import router from "./routes";
import cors from "cors";

class ApiService {
  #port: string;
  #app;

  constructor(port: string) {
    this.#port = port;
    this.#app = express();
  }

  init() {
    this.#registerMiddlewares();
    this.#registerRoutes();

    this.#app.listen(this.#port, () => console.log(`listening for connections on -- :${this.#port}`))
  }

  #registerMiddlewares() {
    this.#app.use(cors());
  }

  #registerRoutes() {
    this.#app.use(router);
  }
}

export const apiService = new ApiService(PORT);
