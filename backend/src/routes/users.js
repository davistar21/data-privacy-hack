import express from "express";
import db from "../../scripts/init-db.js";

const router = express.Router();

router.get("/:id/consents", (req, res) => {
  const stmt = db.prepare("SELECT * FROM consents WHERE userId = ?");
  const data = stmt.all(req.params.id);
  res.json(data);
});

export default router;
