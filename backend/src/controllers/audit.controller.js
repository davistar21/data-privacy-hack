import db from "../../scripts/init-db.js";

export const getOrgLogs = (req, res) => {
  const stmt = db.prepare("SELECT * FROM audit_logs WHERE orgId = ?");
  const logs = stmt.all(req.params.orgId);
  res.json(logs);
};
