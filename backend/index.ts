import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import crypto from "crypto";
import clientRoutes from "./routes/clientsBackend";
import formRoutes from "./routes/formsBackend";
import { getFrontendBaseUrl } from "./utils/getFrontendBaseUrl";

dotenv.config();

const app = express();

type HttpError = Error & {
  status?: number;
};

// --- Security / middleware ---
app.use(helmet());

// --- Dynamic CORS ---
const frontendUrl = getFrontendBaseUrl();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origin === frontendUrl) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// --- API routes ---
app.use("/clients", clientRoutes);
app.use("/forms", formRoutes);

// --- API 404s ---
app.use("/clients", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use("/forms", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- SPA static + fallback (production only) ---
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "../dist");
  const basePath = "/integrate-therapy-form-manager";

  app.use(basePath, express.static(distDir, { index: false }));
  app.get(`${basePath}/*`, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// --- Error handler ---
app.use(
  (
    err: HttpError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const requestId = crypto.randomUUID();
    const statusCandidate = Number(err?.status);
    const status =
      Number.isInteger(statusCandidate) &&
      statusCandidate >= 400 &&
      statusCandidate < 600
        ? statusCandidate
        : 500;

    if (process.env.NODE_ENV === "production") {
      console.error(`[${requestId}]`, err?.message ?? err);
    } else {
      console.error(`[${requestId}]`, err);
    }

    const message =
      status === 500
        ? "Internal server error"
        : (typeof err?.message === "string" && err.message) || "Request failed";

    res.status(status).json({ message, requestId });
  }
);

export default app;
