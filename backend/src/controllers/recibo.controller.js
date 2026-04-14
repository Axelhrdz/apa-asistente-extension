import { config } from "../config/env.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { reciboService } from "../services/recibo.service.js";

export const getAccountRecibos = asyncHandler(async (req, res) => {
  const accountNumber = req.params?.accountNumber;
  if (!accountNumber) {
    return res.status(400).json({ error: "accountNumber is required" });
  }

  if (!config.mongoUri) {
    return res.status(501).json({
      error: "Recibos lookup not fully configured",
      message: "Set MONGODB_URI in backend/.env and restart the API",
      received: accountNumber,
    });
  }

  const { normalized, recibos } = await reciboService.lookupRecibosByAccountNumber(
    accountNumber
  );

  return res.json({
    data: {
      clave_apa: normalized,
      count: recibos.length,
      recibos,
    },
  });
});
