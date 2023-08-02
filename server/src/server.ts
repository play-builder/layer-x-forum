import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

import { AppDataSource } from "./data-source";

// Routes
import authRoutes from "./routes/auth";
import forumRoutes from "./routes/forums";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import voteRoutes from "./routes/votes";
import userRoutes from "./routes/users";

const app = express();

// CORS 설정
const origin = process.env.ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// 이미지 저장 디렉토리 생성
const imageDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Health check endpoint (Elastic Beanstalk용)
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "LayerX Forum API",
  });
});

app.get("/", (_, res) =>
  res.json({
    message: "LayerX Forum API Server",
    version: "1.0.0",
    documentation: "/api",
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

// Static files (이미지)
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

const port = parseInt(process.env.PORT || "4000");

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");

    app.listen(port, "0.0.0.0", () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 LayerX Forum API Server                  ║
║                                               ║
║   Running at: http://0.0.0.0:${port}            ║
║   Environment: ${process.env.NODE_ENV || "development"}                   ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
