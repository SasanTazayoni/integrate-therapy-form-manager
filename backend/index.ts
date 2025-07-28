import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import clientRoutes from "./routes/clientsBackend";
import formRoutes from "./routes/formsBackend";
import { getFrontendBaseUrl } from "./utils/getFrontendBaseUrl";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: getFrontendBaseUrl(),
    credentials: true,
  })
);
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/forms", formRoutes);

export default app;
