import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (config.allowedOrigins.length === 0) return cb(null, true);
        if (config.allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
