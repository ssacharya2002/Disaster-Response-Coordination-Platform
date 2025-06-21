import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import disastersRoutes from "./routes/disasters.js";
import geocodeRoutes from "./routes/geocode.js";
import socialMediaRoutes from "./routes/socialMedia.js";
import resourcesRoutes from "./routes/resources.js";
import imageVerificationRoutes from "./routes/imageVerificationRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use("/api/", limiter);

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/disasters", disastersRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/verification", imageVerificationRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
