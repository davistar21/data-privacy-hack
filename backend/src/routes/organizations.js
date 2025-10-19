import express from "express";
import db from "../../scripts/init-db.js";

const router = express.Router();

router.get("/:orgId/logs", (req, res) => {
  const stmt = db.prepare("SELECT * FROM audit_logs WHERE orgId = ?");
  const logs = stmt.all(req.params.orgId);
  res.json(logs);
});

export default router;
