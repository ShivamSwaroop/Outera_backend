import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
    {
        name: String,
        role: String,
        company: String,
        companyDomain: String,
        linkedinUrl: String,
        email: String,
        verified: { type: Boolean, default: false},
        emailSubject: String,
        emailContent: String,
        emailStatus: { type: String,
            enum: ["pending", "generated", "sent", "failed"],
            default: "pending"
        }
    },
    { _id: false}
);

const CompanySchema = new mongoose.Schema(
    {
    name: String,
    domain: String
    },
    { _id: false }
);

const CampaignSchema = new mongoose.Schema(
    {
        seedDomain: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: [ "running", "awaiting_approval", "sending", "completed", "failed"],

            default: "running"
        },

        currentStage: {
            type: String,
            enum: ["company_discovery", "prospeo_contacts", "prospeo_emails", "openai", "approval", "brevo", "completed"],
            default: "company_discovery"
        },
        similarCompanies: [CompanySchema],
        contacts: [ContactSchema],
        stats:{ companiesFound: {
            type: Number,
            default: 0
        },
        contactsFound: {
             type: Number,
             default: 0
        },
        verifiedEmails: {
             type: Number,
             default: 0
        },
        emailsGenerated: {
             type: Number,
             default: 0
        },
        emailsSent: {
             type: Number,
             default: 0
        },
        summary: {
            type: String,
            default: ""
        }
        },
        logs: [
            {
                stage: String,
                message: String,
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);
const Campaign = mongoose.model("Campaign", CampaignSchema);

export default Campaign;