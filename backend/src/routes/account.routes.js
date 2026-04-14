import { Router } from "express";
import { postAccountLookup } from "../controllers/account.controller.js";
import { getAccountRecibos } from "../controllers/recibo.controller.js";

export const accountRouter = Router();

accountRouter.post("/lookup", postAccountLookup);
accountRouter.get("/:accountNumber/recibos", getAccountRecibos);
