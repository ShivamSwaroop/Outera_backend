import express from "express";
import cors from "cors";

import workflowRoutes from "./routes/workflowRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Outera API Running",
  });
});

app.use("/api/workflow", workflowRoutes);

export default app;
