// auth-middleware.js
import jwt from "jsonwebtoken";

const SECRET = "mock-secret"; // change later

// Mock login: returns a fake JWT
export const adminLogin = (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  // In production: validate credentials from DB
  const token = jwt.sign({ userId: username, role: "admin" }, SECRET, { expiresIn: "1h" });
  res.json({ token });
};

// Mock JWT verification
export const adminAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
