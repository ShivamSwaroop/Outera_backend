import workflowService from "../services/workflow.js";
import Campaign from "../models/campaign.js";

export async function startWorkflow(req, res) {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required",
      });
    }

    const campaign = await Campaign.create({
      seedDomain: domain,
      status: "running",
      currentStage: "company_discovery",
    });


    workflowService.run(domain, campaign._id).catch(console.error);

    return res.status(202).json({
      success: true,
      data: {
        campaignId: campaign._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCampaign(req, res) {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
