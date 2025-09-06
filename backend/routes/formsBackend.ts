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

const router = Router();

router.post("/send-token/:formType", sendForm);
router.post("/send-multiple", sendMultipleForms);
router.post("/revoke-token/:formType", revokeFormToken);
router.get("/validate-token", validateToken);
router.post("/submit/becks", submitBecksForm);
router.post("/submit/burns", submitBurnsForm);
router.post("/submit/ysq", submitYSQForm);
router.post("/submit/smi", submitSMIForm);
router.post("/update-client-info", updateClientInfo);
router.get("/smi/all", getAllSubmittedSMIForms);

export default router;
