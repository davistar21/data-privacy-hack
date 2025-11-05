import Database from 'better-sqlite3';
//const db = new Database('./db/db.sqlite');
import fs from "fs";
import path from "path";

const dbDir = path.resolve("db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const db = new Database(path.join(dbDir, "app.sqlite"));

db.exec(`
  -- users
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        nin TEXT
    );
    -- organizations
    CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT
    );
    -- consents
    CREATE TABLE IF NOT EXISTS consents (
        id TEXT PRIMARY KEY,
        userId TEXT,
        orgId TEXT,
        purpose TEXT, -- e.g., "marketing", "customer_service"
        fields TEXT, -- JSON array like '["name","phone"]'
        consentGiven BOOLEAN,
        givenAt DATETIME,
        revokedAt DATETIME
    );
    -- revocations
    CREATE TABLE IF NOT EXISTS revocations (
        id TEXT PRIMARY KEY,
        userId TEXT,
        orgId TEXT,
        purpose TEXT,
        fields TEXT,
        requestedAt DATETIME,
        status TEXT -- pending | processed | failed
    );
    -- audit_logs
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        revocationId TEXT,
        orgId TEXT,
        userId TEXT,
        auditText TEXT,
        recommendation TEXT,
        legalReferences TEXT,
        status TEXT, -- pending | completed
        generatedAt DATETIME,
        signature TEXT -- HMAC for tamper-evidence
    );
`);

console.log('✅ Database and tables initialized.');
export default db;