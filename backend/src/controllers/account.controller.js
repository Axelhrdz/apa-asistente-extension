import { config } from "../config/env.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { accountService } from "../services/account.service.js";

export const postAccountLookup = asyncHandler(async (req, res) => {
  const { normalized, record } = await accountService.lookupAccount(
    req.body?.accountNumber
  );

  if (!config.mongoUri) {
    return res.status(501).json({
      error: "Account lookup not fully configured",
      message: "Set MONGODB_URI in backend/.env and run the Excel import script",
      received: normalized,
    });
  }

  return res.json({ data: record });
});

export const getPadronOld = asyncHandler(async (req, res) => {
  const { accountNumber } = req.params;
  const { normalized, record } = await accountService.lookupPadronOld(accountNumber);

  if (!config.mongoUri) {
    return res.status(501).json({
      error: "Padron lookup not fully configured",
      message: "Set MONGODB_URI in backend/.env",
      received: normalized,
    });
  }

  return res.json({ data: record });
});
