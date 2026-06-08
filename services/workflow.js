import prospeoService from "./prospeo.js";
import aiService from "./ai.js";
import brevoService from "./brevo.js";
import { getIO } from "../sockets/socket.js";
import Campaign from "../models/campaign.js";

class workflowService {
  async run(seedDomain, campaignId) {
    const io = getIO();
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }
    try {
      io.emit("workflow:update", {
        stage: "company_discovery",
        progress: 10,
        message: "Enriching seed company",
      });
      console.log("Step 1");
      const seedCompany = await prospeoService.enrichCompany(seedDomain);

      io.emit("workflow:update", {
        stage: "company_discovery",
        progress: 30,
        message: "Finding similar companies",
      });
      console.log("Step 2");
      const companies = await prospeoService.searchCompanies(seedCompany);

      console.log(JSON.stringify(companies[0], null, 2));

      campaign.similarCompanies = companies.slice(0, 5).map((item) => ({
        name: item.company?.name,
        domain: item.company?.domain,
      }));
      campaign.stats.companiesFound = companies.length;
      campaign.currentStage = "company_discovery";

      await campaign.save();

      const companyDomains = companies
        .slice(0, 5)
        .map((item) => item.company?.domain)
        .filter(Boolean);

      console.log(companyDomains);

      io.emit("workflow:update", {
        stage: "prospeo_contacts",
        progress: 50,
        message: "Finding decision makers",
      });
      console.log("Step 3");
      const people = await prospeoService.searchDecisionMakers(companyDomains);

      console.log(`Found ${people.length} contacts`);

      io.emit("workflow:update", {
        stage: "prospeo_emails",
        progress: 75,
        message: "Verifying emails",
      });
      console.log("Step 4");
      const contacts = await prospeoService.enrichContacts(people.slice(0, 1));
      console.log(JSON.stringify(contacts[0], null, 2));

      campaign.contacts = contacts.map((contact) => ({
        name: contact.person?.full_name,
        role: contact.person?.job_title,
        company: contact.company?.name,
        companyDomain: contact.company?.domain,
        linkedinUrl: contact.person?.linkedin_url,
        email: contact.person.email?.email || "",
        verified: contact.person.email?.status === "VERIFIED",
      }));

      campaign.stats.contactsFound = contacts.length;
      campaign.stats.verifiedEmails = contacts.length;

      campaign.currentStage = "prospeo_emails";

      await campaign.save();

      console.log(`Enriched ${contacts.length}`);

      io.emit("workflow:update", {
        stage: "openai",
        progress: 80,
        message: "generating emails",
      });

      console.log(campaign.contacts);
      console.log("Starting AI generation");
      for (const contact of campaign.contacts) {
        const email = await aiService.generateEmail({
          name: contact.name,
          role: contact.role,
          company: contact.company,
        });

        console.log("Generated:", email.subject);
        contact.emailSubject = email.subject;
        contact.emailContent = email.body;
        contact.emailStatus = "generated";
      }

      campaign.stats.emailsGenerated = campaign.contacts.length;
      campaign.currentStage = "openai";

      await campaign.save();

      io.emit("workflow:update", {
        stage: "brevo",
        progress: 95,
        message: "Sending emails",
      });
      console.log("Starting Brevo sending");
      for (const contact of campaign.contacts) {
        try {
          await brevoService.sendEmail({
            to: contact.email,
            subject: contact.emailSubject,
            html: `<p>${contact.emailContent}</p>`,
          });
          contact.emailStatus = "sent";
          console.log("Sending to:", contact.email);
        } catch (error) {
          contact.emailStatus = "failed";
        }
      }
      campaign.stats.emailsSent = campaign.contacts.filter(
        (contact) => contact.emailStatus === "sent",
      ).length;

      campaign.status = "completed";
      campaign.currentStage = "completed";
      campaign.stats.summary =
        `${campaign.stats.companiesFound} companies, ` +
        `${campaign.stats.contactsFound} contacts, ` +
        `${campaign.stats.emailsSent} emails sent`;

        io.emit("workflow:update", {
          stage: "completed",
          progress: 100,
          message: "Workflow completed successfully",
          campaignId: campaign._id,
        });
      await campaign.save();

      return { campaignId: campaign._id };
    } catch (error) {
      if (campaign) {
        campaign.status = "failed";

        campaign.logs.push({
          stage: campaign.currentStage,
          message: error.message,
        });

        await campaign.save();
      }

      io.emit("workflow:error", {
        message: error.message,
      });

      throw error;
    }
  }
}

export default new workflowService();
