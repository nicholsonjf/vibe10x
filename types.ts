
export enum AppStep {
  InitialForm,
  Conversation,
  Documents,
}

export interface ProjectDetails {
  idea: string;
  audience: string;
  goal: string;
}

export enum ChatRole {
    USER = 'user',
    MODEL = 'model',
}

export interface ChatMessage {
    role: ChatRole;
    text: string;
}

export interface GeneratedDocs {
    prd: string;
    plan: string;
    gemini: string;
}
