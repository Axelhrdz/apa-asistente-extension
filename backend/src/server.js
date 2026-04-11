import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// JSON bodies (for future POST /lookup, etc.)
app.use(express.json());

// CORS: allow extension + local dev app (e.g. Vite on 5173). Tighten in production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // same-origin or non-browser
      if (allowedOrigins.length === 0) return cb(null, true); // dev: allow all if unset
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "apa-asistente-api" });
});

// Placeholder for account lookup — wire MongoDB here later
app.post("/api/accounts/lookup", (req, res) => {
  const accountNumber = req.body?.accountNumber;
  if (!accountNumber || typeof accountNumber !== "string") {
    return res.status(400).json({ error: "accountNumber is required" });
  }
  res.status(501).json({
    message: "Not implemented yet — connect MongoDB and return record",
    received: accountNumber.trim(),
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
