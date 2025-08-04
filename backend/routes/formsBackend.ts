import { Router } from "express";
import {
  createForm,
  sendForm,
  validateToken,
  revokeFormToken,
  submitBecksForm,
  submitBurnsForm,
  updateClientInfo,
  getBecksForm,
} from "../controllers/formController";

const router = Router();

router.post("/", createForm);
router.post("/send-token/:formType", sendForm);
router.post("/revoke-token/:formType", revokeFormToken);
router.get("/validate-token", validateToken);
router.get("/becks/:email", getBecksForm);
router.post("/submit/becks", submitBecksForm);
router.post("/submit/burns", submitBurnsForm);
router.post("/update-client-info", updateClientInfo);

export default router;
