import { Router } from "express";
import {
  createClientHandler,
  getClientFormsStatusHandler,
  deleteClientByEmailHandler,
  deactivateClientHandler,
  activateClientHandler,
} from "../controllers/clientsController";

const router = Router();

router.post("/add", createClientHandler);
router.get("/form-status", getClientFormsStatusHandler);
router.delete("/by-email", deleteClientByEmailHandler);
router.patch("/deactivate", deactivateClientHandler);
router.patch("/activate", activateClientHandler);

export default router;
