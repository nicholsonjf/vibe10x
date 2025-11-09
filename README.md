# Vibe10x

[![React Badge](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white)](#tech-stack)
[![Vite Badge](https://img.shields.io/badge/Bundler-Vite-646cff?logo=vite&logoColor=white)](#scripts)
[![TypeScript Badge](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](#tech-stack)

AI-assisted requirement gathering for builders who want production-quality documentation from casual conversations.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Demo Walkthrough](#demo-walkthrough)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run the App](#run-the-app)
  - [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
  - [Conversation Workflow](#conversation-workflow)
  - [Document Generation](#document-generation)
  - [State Management](#state-management)
- [Configuration Notes](#configuration-notes)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

Vibe10x is an AI-powered assistant that transforms open-ended product ideation into the structured documentation software teams need. Product managers and founders can speak naturally while the assistant drives a clarifying dialogue and delivers a downloadable package of:

- **`prd.md`** – a senior-level Product Requirements Document.
- **`plan.md`** – a tactical execution plan or task breakdown.
- **`gemini.md`** – an instruction file optimized for AI coding agents.

The experience focuses on solving the "trash in = trash out" problem for AI-generated software by front-loading high quality prompts and specs.

## Key Features

- 🧭 **Guided triage flow** that walks users from initial project idea through follow-up Q&A.
- 🤖 **Gemini 2.5 Flash integration** for fast, structured responses via the official `@google/genai` SDK.
- 🗂️ **Multi-document export** powered by JSZip to deliver ready-to-share markdown in a single archive.
- ⚛️ **React 19 + Vite toolchain** with modern TypeScript typings for a lightweight developer experience.
- 🔐 **Secure API usage** that fails fast when credentials are missing or misconfigured.

## Demo Walkthrough

1. Enter the problem statement, target audience, goals, and optional tech stack.
2. Chat with the AI assistant as it asks one question at a time to fill in the gaps.
3. Review the generated documents in a tabbed preview and download the packaged zip.

## Getting Started

### Prerequisites

- Node.js 20+ and npm (or a compatible package manager).
- A Google Gemini API key with access to the Flash model family.

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Environment Variables

The app expects a single environment variable named `API_KEY` to be available at runtime. When hosting on platforms like Google AI Studio, configure this value in the hosting dashboard. Locally, you can export it before starting the dev server:

```bash
export API_KEY="your_gemini_api_key"
```

> The client will throw an explicit error if the key is missing so you can catch misconfigurations early.

### Run the App

Start a hot-reloading development server:

```bash
npm run dev
```

By default Vite serves the app at [http://localhost:5173](http://localhost:5173). Open the URL in your browser and begin the guided flow.

### Build for Production

Generate an optimized bundle suitable for static hosting:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── App.tsx                 # Root component orchestrating the three-step flow
├── components/
│   ├── Step1_InitialForm.tsx  # Intake form that captures project metadata
│   ├── Step2_Conversation.tsx # Chat interface that streams questions & answers
│   ├── Step3_Documents.tsx    # Markdown previews and zip download UX
│   ├── icons/                 # SVG icon exports for the UI
│   └── ui/
│       └── Loader.tsx         # Reusable loading indicator
├── constants.ts            # Shared constants and initial state definitions
├── index.html              # HTML entry point including CDN-delivered styles
├── index.tsx               # React DOM bootstrap file
├── services/
│   └── geminiService.ts    # Gemini API client with start & generate flows
├── types.ts                # Shared TypeScript enums and interfaces
├── vite.config.ts          # Vite + React configuration
└── README.md
```

## Core Concepts

### Conversation Workflow

`services/geminiService.ts` seeds the Gemini chat session with a senior engineering manager persona. During the conversation the assistant asks targeted follow-up questions, one at a time, until the user provides enough detail to proceed.

### Document Generation

When the conversation completes, `generateDocuments` sends the full transcript and project brief back to Gemini with a new persona prompt. A strict response schema ensures the API returns well-formed JSON that can be parsed into the three markdown documents without guesswork.

### State Management

`App.tsx` coordinates the application state with React hooks, including the current step, collected inputs, chat history, loading indicators, and the final generated documents. This keeps the logic centralized and easy to extend.

## Configuration Notes

- The Gemini SDK reads `process.env.API_KEY` at runtime. Double-check your build tooling or hosting provider exposes the variable to the client.
- If you rotate keys frequently, consider wiring a secrets manager or proxy server to avoid redeploying the static client.

## Scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Start the Vite development server.         |
| `npm run build`  | Create a production-ready build.           |
| `npm run preview`| Preview the production build locally.      |

## Tech Stack

- **Framework:** React 19, TypeScript 5.8
- **Tooling:** Vite 6, @vitejs/plugin-react, ESBuild under the hood
- **AI Services:** Google Gemini 2.5 Flash via `@google/genai`
- **Utilities:** JSZip (CDN) for zip archive generation
- **Styling:** Tailwind CSS loaded via CDN in `index.html`

## Troubleshooting

- **Missing API Key:** The UI will report `Missing API_KEY environment variable` if the credential is absent. Set the variable and refresh the page.
- **CORS or network errors:** Verify your hosting environment allows outbound requests to the Gemini API endpoints.
- **Empty document output:** Confirm that the conversation reached completion and that the Gemini quota has not been exceeded.

## Contributing

Issues and pull requests are welcome! If you plan substantial changes, open an issue to discuss the scope first. Please run `npm run build` locally to ensure the production bundle succeeds before submitting.

## License

This project has not specified a license. If you intend to use the code in production, reach out to the maintainers or add a license file that matches your needs.

