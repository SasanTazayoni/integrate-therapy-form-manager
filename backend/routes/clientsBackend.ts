import { Router } from "express";
import {
  createClientHandler,
  getClientFormsStatusHandler,
  deleteClientByEmailHandler,
} from "../controllers/clientsController";

const router = Router();

router.post("/add", createClientHandler);
router.get("/form-status", getClientFormsStatusHandler);
router.delete("/by-email", deleteClientByEmailHandler);

export default router;
