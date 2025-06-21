import express from "express";
import {
  getSocialMediaPosts,
  fetchTwitterPosts,
  getMockSocialMedia,
} from "../controllers/socialMediaController.js";

const router = express.Router();

router.get("/disasters/:id/social-media", getSocialMediaPosts);
router.get("/:id/social-media", fetchTwitterPosts);
router.get("/mock-social-media", getMockSocialMedia);

export default router;
