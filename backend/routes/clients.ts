import { Router } from "express";
import {
  createClient,
  getClientFormsStatus,
} from "../controllers/clientController";

const router = Router();

router.post("/", createClient);
router.get("/form-status", getClientFormsStatus);

export default router;
