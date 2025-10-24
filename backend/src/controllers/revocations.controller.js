import db from "../../scripts/init-db.js";
import { v4 as uuidv4 } from "uuid";
import { broadcastRevocationEvent } from "./sse/sse.controller.js";
import { getAIAdapter } from "../services/ai/aiAdapter.js";
import * as crypto from 'crypto'; // Needed for HMAC/signing (if implemented later)


// --- Helper Function: Generates an initial, unsigned audit log record ---
const createPlaceholderAudit = ({ revocationId, orgId, userId, auditId, timestamp }) => {
    // Note: recommendation and legalReferences are JSON strings
    return [
        auditId,
        revocationId,
        orgId,
        userId,
        "Revocation request received. Awaiting compliance analysis.", // Placeholder auditText
        '[]', // Placeholder JSON string for recommendation
        '["NDPR - Data Subject Rights"]', // Minimum legal reference
        "pending",
        timestamp,
        "UNSIGNED_PLACEHOLDER" // Temporary signature placeholder
    ];
};

// --- Stub AI adapter ---
async function analyzeRevocation(revocation) {
    const aiAdapter = getAIAdapter();
    // The AI adapter returns the complete, generated audit log data (excluding signature/status if we update them later)
    const aiResult = await aiAdapter.generateAudit(revocation, { timeout: 300000, maxRetries: 2, useCache: true });
    return aiResult;
}
// --- End stub --- 

export const createRevocation = async (req, res) => {
    const { userId, orgId, purpose, fields } = req.body;
    const revocationId = uuidv4();
    const auditId = uuidv4();
    const timestamp = new Date().toISOString();

    // 1. Prepare initial database data
    const revocationArgs = [revocationId, userId, orgId, purpose, JSON.stringify(fields), timestamp, "pending"];
    const auditArgs = createPlaceholderAudit({ revocationId, orgId, userId, auditId, timestamp });


    const insertRevocation = db.prepare(`
        INSERT INTO revocations (id, userId, orgId, purpose, fields, requestedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAudit = db.prepare(`
        INSERT INTO audit_logs (
            id, revocationId, orgId, userId, auditText,
            recommendation, legalReferences, status,
            generatedAt, signature
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 2. Run initial transaction synchronously
    try {
        const tx = db.transaction(() => {
            insertRevocation.run(...revocationArgs);
            insertAudit.run(...auditArgs); // Splat the array of arguments
        });
        tx();
    } catch (error) {
        console.error("Database transaction failed:", error);
        return res.status(500).json({ message: "Failed to log revocation and audit" });
    }

    // 3. Respond immediately
    res.status(201).json({
        message: "Revocation stored and placeholder audit logged",
        revocationId,
        auditId,
    });

    // 4. Broadcast immediate revocation event
    broadcastRevocationEvent({
        type: "revocation_created",
        userId,
        orgId,
        purpose,
        status: "pending",
        timestamp,
    });

    // 5. Run AI analysis asynchronously and update the log
    analyzeRevocation({ id: revocationId, userId, orgId, purpose, fields, requestedAt: timestamp })
        .then((aiResult) => {
            // Note: aiResult already contains the full, generated audit log data
            
            // Assuming we use the aiResult directly for the update
            const updateAudit = db.prepare(`
                UPDATE audit_logs SET
                    auditText = ?,
                    recommendation = ?,
                    legalReferences = ?,
                    status = 'completed',
                    signature = ? 
                WHERE id = ?
            `);
            
            // ⚠️ WARNING: HMAC is a critical security step.
            // You should calculate the final signature *here* using aiResult's data,
            // rather than relying on the "PLACEHOLDER_FOR_HMAC" from the adapter.
            // For now, we use the adapter's result:
            
            updateAudit.run(
                aiResult.auditText,
                aiResult.recommendation, // These are expected to be JSON strings
                aiResult.legalReferences,
                aiResult.signature,
                auditId // Use the ID generated earlier
            );

            broadcastRevocationEvent({
                type: "ai_analysis_completed",
                revocationId: revocationId,
                orgId,
                userId,
                aiResult,
                timestamp: new Date().toISOString(),
            });
        })
        .catch(console.error);
};