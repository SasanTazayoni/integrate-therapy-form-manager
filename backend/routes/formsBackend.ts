import { Router } from "express";
import {
  sendForm,
  sendMultipleForms,
  validateToken,
  revokeFormToken,
  updateClientInfo,
  getAllSubmittedSMIForms,
} from "../controllers/formController";
import {
  submitBecksForm,
  submitBurnsForm,
  submitYSQForm,
  submitSMIForm,
} from "../controllers/formSubmitHandlers";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Client-facing routes (no auth required)
router.get("/validate-token", validateToken);
router.post("/submit/becks", submitBecksForm);
router.post("/submit/burns", submitBurnsForm);
router.post("/submit/ysq", submitYSQForm);
router.post("/submit/smi", submitSMIForm);
router.post("/update-client-info", updateClientInfo);

// Therapist-only routes
router.post("/send-token/:formType", requireAuth, sendForm);
router.post("/send-multiple", requireAuth, sendMultipleForms);
router.post("/revoke-token/:formType", requireAuth, revokeFormToken);
router.get("/smi/all", requireAuth, getAllSubmittedSMIForms);

export default router;
