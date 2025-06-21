import express from "express";
import { geocodeLocation } from "../controllers/geolocationController.js";

const router = express.Router();

router.post("/", geocodeLocation);

export default router;
