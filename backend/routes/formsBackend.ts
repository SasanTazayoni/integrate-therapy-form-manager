import { Router } from "express";
import {
  createForm,
  sendForm,
  validateToken,
  submitForm,
  revokeFormToken,
} from "../controllers/formController";

const router = Router();

router.post("/", createForm);
router.post("/send-token/:formType", sendForm);
router.post("/revoke-token/:formType", revokeFormToken);
router.get("/validate-token", validateToken);
router.post("/submit", submitForm);

export default router;
