import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

class ProspeoService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.prospeo.io",
      headers: {
        "X-KEY": process.env.PROSPEO_API_KEY,
        "Content-Type": "application/json",
      },
    });
  }
  // services/prospeo.js

  async enrichCompany(domain) {
    try {
      const response = await this.api.post("/enrich-company", {
        data: {
          company_website: domain,
        },
      });
      console.log("Prospeo Success:", response.data);

      return response.data.company;
    } catch (error) {
      console.log(error.response?.data);
      console.log(error.response?.status);
      console.log("Response:", JSON.stringify(error.response?.data, null, 2));
      console.log("Message:", error.message);
      throw new Error(
        `Prospeo Company Enrich Error: ${
          error.response?.data?.error_code || error.message
        }`,
      );
    }
  }

  async searchCompanies(companyData) {
    try {
      const response = await this.api.post("/search-company", {
        page: 1,

        filters: {
          company_industry: {
            include: [companyData.industry],
          },
        },
      });

      return response.data.results || [];
    } catch (error) {
      throw new Error(
        `Prospeo Company Search Error: ${
          error.response?.data?.error_code || error.message
        }`,
      );
    }
  }

  async searchDecisionMakers(companyDomains = []) {
    if (!companyDomains.length) {
      throw new Error("No company domains found");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const response = await this.api.post("/search-person", {
        page: 1,
        filters: {
          company: {
            websites: {
              include: companyDomains,
            },
          },

          person_seniority: {
            include: ["Founder/Owner", "Director", "C-Suite", "Vice President"],
          },
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.log(JSON.stringify(error.response?.data, null, 2));
      throw new Error(
        `Prospeo Search Error: ${
          error.response?.data?.error_code || error.message
        }`,
      );
    }
  }

  async enrichContacts(searchResults = []) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const payload = searchResults.map((item, index) => ({
        identifier: String(index + 1),
        person_id: item.person.person_id,
      }));

      const response = await this.api.post("/bulk-enrich-person", {
        only_verified_email: true,
        data: payload,
      });

      return response.data.matched || [];
    } catch (error) {
      throw new Error(
        `Prospeo Enrich Error: ${
          error.response?.data?.error_code || error.message
        }`,
      );
    }
  }
}

export default new ProspeoService();
  