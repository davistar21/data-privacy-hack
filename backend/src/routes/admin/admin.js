import express from "express";
import cors from "cors";
import { adminAuthenticate, adminLogin } from "../../middlewares/auth/auth.middleware.js";
import { adminCorsOptions } from "../../config/cors.config.js";

// --- Admin Routes Group ---
const adminRouter = express.Router();

// 1. Apply restrictive CORS settings to all admin routes
adminRouter.use(cors(adminCorsOptions));

// 2. Add mock login endpoint (public)
adminRouter.post("/login", adminLogin);

// 3. Apply JWT authentication middleware to all subsequent admin routes
adminRouter.use(adminAuthenticate);

// 4. Define protected admin endpoints (CRUD)
adminRouter.get("/users", (req, res) => {
  res.json({ message: `List of users accessed by: ${req.user.userId}` });
});

adminRouter.delete("/users/:id", (req, res) => {
  res.json({ message: `Deleted user ${req.params.id}` });
});

export default adminRouter;
