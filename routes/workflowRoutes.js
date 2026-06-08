import express from "express";
import { startWorkflow, getCampaign } from "../controller/workflowController.js";

const router = express.Router();

router.post("/start", startWorkflow);

router.get("/:id", getCampaign);

export default router;