import express from "express";
import db from "../../scripts/init-db.js";
import { getOrgLogs } from "../controllers/audit.controller.js";

const router = express.Router();

router.get("/:orgId/logs", getOrgLogs);

export default router;
