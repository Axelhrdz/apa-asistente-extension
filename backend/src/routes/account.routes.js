import { Router } from "express";
import { postAccountLookup } from "../controllers/account.controller.js";

export const accountRouter = Router();

accountRouter.post("/lookup", postAccountLookup);
