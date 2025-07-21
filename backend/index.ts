import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./routes/clients";
import formRoutes from "./routes/forms";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/forms", formRoutes);

export default app;
