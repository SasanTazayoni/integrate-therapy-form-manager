import { Router } from "express";
import {
  createClientHandler,
  getClientFormsStatusHandler,
} from "../controllers/clientsController";

const router = Router();

router.post("/add", createClientHandler);
router.get("/form-status", getClientFormsStatusHandler);

export default router;
