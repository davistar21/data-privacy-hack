import express from "express";
import { createRevocation } from "../controllers/revocations.controller.js";

const router = express.Router();

router.post("/", createRevocation);

export default router;
