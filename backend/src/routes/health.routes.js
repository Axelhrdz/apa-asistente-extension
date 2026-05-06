import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { testOldPadron } from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/health", getHealth);
healthRouter.get("/test-old-padron", testOldPadron);