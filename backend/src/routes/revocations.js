import express from "express";
import db from "../../scripts/init-db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { id, userId, orgId, purpose, fields, requestedAt, status } = req.body;

  const stmt = db.prepare(`
    INSERT INTO revocations (id, userId, orgId, purpose, fields, requestedAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, orgId, purpose, fields, requestedAt, status);

  res.json({ message: "Revocation stored" });
});

export default router;
