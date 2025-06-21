import express from "express";
import {
  getResources,
  createResource,
  deleteResource,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/disasters/:id/resources", getResources);
router.post("/disasters/:id/resources", createResource);
router.delete("/disasters/:id/resources/:resourceId", deleteResource);

export default router;
