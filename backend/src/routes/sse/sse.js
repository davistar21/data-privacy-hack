import express from "express";
import { registerSSEClient } from "../../controllers/sse/sse.controller.js";

const router = express.Router();

router.get("/events", registerSSEClient);

export default router;
