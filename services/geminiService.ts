
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ProjectDetails, ChatMessage, GeneratedDocs, ChatRole } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const startConversation = async (projectDetails: ProjectDetails): Promise<{ chat: Chat; firstMessage: string }> => {
    const systemInstruction = `You are a world-class Senior Engineering Manager conducting a project scoping session. Your goal is to transform a user's vague idea into a crystal-clear set of requirements for an AI coding agent.

    **Your Process:**
    1.  **Gauge Expertise First:** Your very first message to the user must be exactly: "What is your software development experience level? Please pick beginner, intermediate, or advanced." Do not ask any other question until you receive their answer.
    2.  **Adapt Tone & Depth:** Once the user shares their level, tailor all subsequent wording, analogies, and detail to match it (beginner = plain language and definitions, intermediate = balanced explanations, advanced = concise and technical). Refer back to their level whenever you plan a question.
    3.  **Acknowledge & Confirm:** After noting their expertise level, briefly acknowledge the user's idea to show you've understood.
    4.  **Ask One Clarifying Question:** Ask ONE intelligent, targeted question at a time to dive deeper into a specific aspect of the project. Your questions should be inspired by best practices for building robust software.
    5.  **Be Concise:** Keep your responses and questions short and to the point. Avoid long paragraphs.
    6.  **Guide the Conversation:** Methodically cover key areas: features, user flow, data models, non-functional requirements (like authentication, performance), and edge cases.
    
    Here is the user's initial project brief:
    - **Project Idea:** "${projectDetails.idea}"
    - **Target Audience:** ${projectDetails.audience}
    - **Key Goal:** "${projectDetails.goal}"
    
    Start the conversation now. Acknowledge their idea and ask your first, most critical question.`;

    const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    const response = await chat.sendMessage({ message: "Let's begin." });
    const firstMessage = response.text.trim();
    
    return { chat, firstMessage };
};

export const continueConversation = async (chat: Chat, message: string): Promise<string> => {
    const response = await chat.sendMessage({ message });
    return response.text.trim();
};

export const generateDocuments = async (projectDetails: ProjectDetails, chatHistory: ChatMessage[]): Promise<GeneratedDocs> => {
    const conversationTranscript = chatHistory
        .map(msg => `${msg.role === ChatRole.USER ? 'User' : 'AI Assistant'}: ${msg.text}`)
        .join('\n');
    
    const baseContext = `
      Act as a 10x Principal Engineer. Based on the initial project brief and the detailed conversation transcript below, generate a complete, production-ready markdown document for an AI coding agent.

      **Initial Project Brief:**
      - Project Idea: "${projectDetails.idea}"
      - Target Audience: ${projectDetails.audience}
      - Key Goal: "${projectDetails.goal}"

      **Full Conversation Transcript:**
      ${conversationTranscript}
    `;

    // Generate prd.md
    const prdPrompt = `${baseContext}

      **Your Task:**
      Generate the complete content for 'prd.md' - a comprehensive technical specification. Must include:
      - **Project Goal:** A concise summary.
      - **Core Requirements:** A numbered list of specific, testable features.
      - **Non-Goals:** What is explicitly out of scope.
      - **Tech Stack:** Justify the chosen technologies.
      - **Success Criteria:** How to measure project completion.

      Generate ONLY the markdown content for prd.md. Do not include any wrapper text or explanations.
    `;

    // Generate plan.md
    const planPrompt = `${baseContext}

      **Your Task:**
      Generate the complete content for 'plan.md' - a detailed project plan broken into milestones. Must include:
      - Each milestone should have a clear goal.
      - Break down each milestone into specific tasks.
      - Each task must be granular, estimated to take 2-4 hours.
      - For each task, specify implementation details and clear test conditions.
      - Clearly mark dependencies between tasks (e.g., "Depends on: Task #1.3").

      Generate ONLY the markdown content for plan.md. Do not include any wrapper text or explanations. Make sure the plan is complete and comprehensive.
      Remind about the token limit of 65536. If you exceed the token limit, you will be penalized.
    `;

    // Generate gemini.md
    const geminiPrompt = `${baseContext}

      **Your Task:**
      Generate the complete content for 'gemini.md' - a set of system-enforced instructions for the AI coding agent. Must include:
      - Rules like "Always read prd.md before implementing," "Follow plan.md strictly," "Write tests before code," and "Commit only on passing tests."
      - Additional best practices for AI coding agents.

      Generate ONLY the markdown content for gemini.md. Do not include any wrapper text or explanations.
    `;

    // Generate each document separately
    const [prdResponse, planResponse, geminiResponse] = await Promise.all([
        ai.models.generateContent({
            model: model,
            contents: prdPrompt,
            config: {
                maxOutputTokens: 65536,
            },
        }),
        ai.models.generateContent({
            model: model,
            contents: planPrompt,
            config: {
                maxOutputTokens: 65536,
            },
        }),
        ai.models.generateContent({
            model: model,
            contents: geminiPrompt,
            config: {
                maxOutputTokens: 65536,
            },
        }),
    ]);

    return {
        prd: prdResponse.text.trim() || "# Error: Could not generate prd.md",
        plan: planResponse.text.trim() || "# Error: Could not generate plan.md",
        gemini: geminiResponse.text.trim() || "# Error: Could not generate gemini.md",
    };
};
