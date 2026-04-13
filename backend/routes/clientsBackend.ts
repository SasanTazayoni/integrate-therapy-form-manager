import { Router } from "express";
import {
  createClientHandler,
  getClientFormsStatusHandler,
  deleteClientByEmailHandler,
  deactivateClientHandler,
  activateClientHandler,
} from "../controllers/clientsController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/add", createClientHandler);
router.get("/form-status", getClientFormsStatusHandler);
router.delete("/by-email", deleteClientByEmailHandler);
router.patch("/deactivate", deactivateClientHandler);
router.patch("/activate", activateClientHandler);

export default router;
