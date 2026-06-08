import { createApiClient } from "./http/apiClient.js";

class BrevoService{
    constructor(){
        this.client = createApiClient(
            "https://api.brevo.com/v3",
            {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json"
            }
        );
    }

    async sendEmail({ to, subject, html}){
        try{
            const response = await this.client.post("/smtp/email",
                { sender: {
                    name: "Outera",
                    email: "team@outera.online"
                },
                to: [
                    {
                        email: to
                    },
                ],

                subject,

                htmlContent: html
            }
            );
            return {
                success: true,
                messageId: response.data.messageId
            };
        }catch(error){
            throw new Error(`Brevo Service: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new BrevoService();