import dotenv from "dotenv"
dotenv.config()
import Groq from "groq-sdk";

class AIService {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  buildPrompt(contact) {
    return `
You are writing a personalized cold outreach email.

Recipient Details:
Name: ${contact.name}
Role: ${contact.role}
Company: ${contact.company}

Requirements:
- Professional
- Friendly
- Under 120 words
- Clear CTA
- No generic sales language

Return ONLY valid JSON.

{
  "subject": "...",
  "body": "..."
}
`;
  }

  async generateEmail(contact) {
    try {
      const completion = await this.client.chat.completions.create({
        model: process.env.GROQ_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: this.buildPrompt(contact),
          },
        ],
      });

      const content = completion.choices[0].message.content;

      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`AI Service: ${error.message}`);
    }
  }
}

export default new AIService();
