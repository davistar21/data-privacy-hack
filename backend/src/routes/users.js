import express from "express";
import db from "../../scripts/init-db.js";
import { getUserConsents } from "../controllers/consent.controller.js";

const router = express.Router();

router.get("/:id/consents", getUserConsents);

export default router;
