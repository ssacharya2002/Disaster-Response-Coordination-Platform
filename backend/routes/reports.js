import express from "express";
import {
  createReport,
  getReportsByDisasterId,
  updateReport,
} from "../controllers/reportController.js";

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

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
};

router.post("/disasters/:id/reports", createReport);
router.get("/disasters/:id/reports", getReportsByDisasterId);
router.put("/:id", authenticate, requireAdmin, updateReport);

export default router; 