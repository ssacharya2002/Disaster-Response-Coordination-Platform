import express from "express";
import { verifyImageForDisaster } from "../controllers/imageVerificationController.js";

const router = express.Router();

router.post("/disasters/:id/verify-image", verifyImageForDisaster);

export default router;
