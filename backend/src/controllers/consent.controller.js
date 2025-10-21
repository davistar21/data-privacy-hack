import db from "../../scripts/init-db.js";

export const getUserConsents = (req, res) => {
  const stmt = db.prepare("SELECT * FROM consents WHERE userId = ?");
  const data = stmt.all(req.params.id);
  res.json(data);
};
