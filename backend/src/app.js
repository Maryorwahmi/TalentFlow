import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import {
    notFoundHandler,
    errorHandler
} from "./shared/middleware/error-handler.js";
import { sendSuccess } from "./shared/middleware/api-response.js";
import { requestContext } from "./shared/middleware/request-context.middleware.js";
import { optionalAuth } from "./shared/middleware/auth.middleware.js";
import unifiedRoutes from "./unified/routes.js";
import { uploadRoot } from "./shared/middleware/upload.middleware.js";
import { profileUploadRoot } from "./shared/middleware/profile-upload.middleware.js";
import { env } from "./shared/db/env.js";
import { createRateLimiter } from "./shared/middleware/rate-limit.middleware.js";

const app = express();

function isAllowedDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin)
    || /^https:\/\/[a-z0-9-]+\.ngrok\.io$/i.test(origin);
}

function resolveCorsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true);
  }

  if (env.nodeEnv !== "production" && isAllowedDevOrigin(origin)) {
    return callback(null, true);
  }

  if (env.corsOrigins.length === 0 && env.nodeEnv !== "production") {
    return callback(null, true);
  }

  if (env.corsOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error("Origin not allowed by CORS"));
}

const corsOptions = {
  origin: resolveCorsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning'],
  optionsSuccessStatus: 200
};

const apiRateLimit = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax
});

const authRateLimit = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  message: "Too many authentication attempts. Please wait and try again."
});

// Configure helmet to disable ETags (prevents 304 Not Modified responses)
app.use(helmet({
  hsts: false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "no-referrer" }
}));

// Explicitly disable ETag
app.disable('etag');

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);
app.use(optionalAuth);
app.use("/api", apiRateLimit);
app.use("/api/v1/auth", authRateLimit);

// Disable caching on API endpoints to prevent 304 responses
app.use('/api', (request, response, next) => {
  response.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

app.use("/uploads", express.static(uploadRoot));
app.use('/uploads/profile_pictures', express.static(profileUploadRoot));

app.get("/health", (request, response) => {
    return sendSuccess(request, response, 200, {
        status: "ok",
        service: "TalentFlow Platform API",
        database: env.dataSource === "mysql" ? env.mysqlDatabase : "backend/data/db.json",
        architecture: env.dataSource === "mysql" ? "mysql-backed-unified-service" : "single-json-service",
        environment: env.nodeEnv,
        dataSource: env.dataSource,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime())
    });
});

app.use("/api/v1", unifiedRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
