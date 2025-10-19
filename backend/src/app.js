import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";

import userRoutes from "./routes/users.js";
import revocationRoutes from "./routes/revocations.js";
import orgRoutes from "./routes/organizations.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

app.use("/api/user", userRoutes);
app.use("/api/revocations", revocationRoutes);
app.use("/api/org", orgRoutes);

export default app;
