import db from "../../scripts/init-db.js";
import { v4 as uuidv4 } from "uuid";
import { broadcastRevocationEvent } from "./sse/sse.controller.js";


// --- Stub AI adapter ---
async function analyzeRevocation(revocation) {
  console.log("AI adapter received revocation:", revocation.id);
  await new Promise((r) => setTimeout(r, 2000)); // simulate delay
  console.log("AI adapter completed review for:", revocation.id);
}

export const createRevocation = (req, res) => {
  const { userId, orgId, purpose, fields, status = "pending" } = req.body;

  const id = uuidv4();
  const auditId = uuidv4();
  const timestamp = new Date().toISOString();

  const insertRevocation = db.prepare(`
    INSERT INTO revocations (id, userId, orgId, purpose, fields, requestedAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (
      id,
      revocationId,
      orgId,
      userId,
      auditText,
      recommendation,
      legalReferences,
      status,
      generatedAt,
      signature
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertRevocation.run(id, userId, orgId, purpose, JSON.stringify(fields), timestamp, status);
    insertAudit.run(
      auditId,
      id,
      orgId,
      userId,
      "Revocation created. Awaiting AI analysis.",
      null,
      null,
      "pending",
      timestamp,
      null
    );
  });

  tx();

  res.status(201).json({
    message: "Revocation stored and audit logged",
    revocationId: id,
  });

  broadcastRevocationEvent({
    type: "revocation_created",
    userId,
    orgId,
    purpose,
    status,
    timestamp,
  });

  analyzeRevocation({ id, userId, orgId, purpose, fields }).catch(console.error);
};
