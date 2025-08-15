import { Router } from "express";
import {
  createForm,
  sendForm,
  validateToken,
  revokeFormToken,
  updateClientInfo,
} from "../controllers/formController";
import {
  submitBecksForm,
  submitBurnsForm,
  submitYSQForm,
  submitSMIForm,
} from "../controllers/formSubmitHandlers";

const router = Router();

router.post("/", createForm);
router.post("/send-token/:formType", sendForm);
router.post("/revoke-token/:formType", revokeFormToken);
router.get("/validate-token", validateToken);
router.post("/submit/becks", submitBecksForm);
router.post("/submit/burns", submitBurnsForm);
router.post("/submit/ysq", submitYSQForm);
router.post("/submit/smi", submitSMIForm);
router.post("/update-client-info", updateClientInfo);

export default router;
