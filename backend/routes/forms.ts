import { Router } from "express";
import {
  createForm,
  sendForm,
  validateToken,
  submitForm,
} from "../controllers/formController";

const router = Router();

router.post("/", createForm);
router.post("/send", sendForm);
router.get("/validate-token", validateToken);
router.post("/submit", submitForm);

export default router;
