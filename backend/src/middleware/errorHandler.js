import { config } from "../config/env.js";

export function errorHandler(err, _req, res, _next) {
  const status = Number(err.status) || 500;
  const payload = {
    error: status === 500 ? "Internal Server Error" : err.message || "Error",
  };
  if (config.nodeEnv !== "production" && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
