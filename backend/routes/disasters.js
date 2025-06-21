import express from "express";
import {
  listDisasters,
  getDisasterById,
  getOfficialUpdates,
  createDisaster,
  updateDisaster,
  deleteDisaster,
} from "../controllers/disasterController.js";

const router = express.Router();

// Mock authentication middleware
const authenticate = (req, res, next) => {
  // Mock users
  const users = {
    netrunnerX: { id: "netrunnerX", role: "admin" },
    reliefAdmin: { id: "reliefAdmin", role: "admin" },
    citizen1: { id: "citizen1", role: "contributor" },
  };

  const userId = req.headers["x-user-id"] || "netrunnerX";
  req.user = users[userId] || users["netrunnerX"];
  next();
};

router.get("/", authenticate, listDisasters);
router.get("/:id", authenticate, getDisasterById);
router.get("/:id/official-updates", authenticate, getOfficialUpdates);
router.post("/", authenticate, createDisaster);
router.put("/:id", authenticate, updateDisaster);
router.delete("/:id", authenticate, deleteDisaster);

export default router;
