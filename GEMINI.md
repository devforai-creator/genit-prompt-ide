# GEMINI Project Context: Genit Prompt IDE

This document provides a comprehensive overview of the "Genit Prompt IDE" project for AI-assisted development.

## 1. Project Overview

- **Project Name:** Genit Prompt IDE (gpi)
- **Purpose:** A Tampermonkey userscript that enhances the character creation page on `https://genit.ai`.
- **Core Feature:** The script injects a draggable, IDE-like popup editor when the user focuses on the main character prompt textarea. This provides a superior user experience for writing and managing long, complex system prompts, which are often used on the platform.
- **Technology:** The project is a single userscript written in **vanilla JavaScript (ES2020+)**. It does not have a build step or external dependencies.
- **Architecture:**
  - **DOM Manipulation:** The script directly injects HTML and CSS to create the popup editor UI.
  - **Resilience:** It uses a `MutationObserver` to reliably detect the appearance of the target textarea (`#character_prompt`) on a page, which is crucial for modern, dynamic websites built with frameworks like React.
  - **React-Safe Updates:** When applying changes, the script uses the native `HTMLTextAreaElement` value setter and dispatches synthetic `input`/`change` events to ensure the React framework recognizes the new value. This prevents the website from overwriting the script's changes.

## 2. Building and Running

This project does not have a traditional build process. The source code is the final product.

**Installation and Execution:**

1.  **Install a Userscript Manager:** Install a browser extension like **Tampermonkey** (for Chrome) or **Violentmonkey** (for Firefox).
2.  **Create a New Script:** Open the userscript manager's dashboard and create a new script.
3.  **Copy-Paste Code:** Copy the entire content of `src/gpi.user.js`.
4.  **Save:** Paste the code into the new script editor in your userscript manager and save it.
5.  **Verify:** Navigate to `https://genit.ai/ko/create/content`. The script is now active.
    - To trigger the IDE, click on or focus the main prompt input field.
    - You can also check the browser's developer console for the message `[GPI] Userscript loaded` to confirm it's running.

## 3. Development Conventions

This project has a unique, multi-agent development workflow.

**AI Agent Roles:**

The work is divided among several AI agents and a human user:

- **Claude:** Responsible for high-level planning and documentation.
- **Codex:** The primary programmer, responsible for implementation and technical review.
- **Gemini (this agent):** Acts as an interpreter, explaining the technical work of Codex and Claude to the human user.

**Development Workflow:**

The project is developed in milestones, with progress and plans tracked in the `reviews/roadmap/` directory.

1.  **Analysis (`docs/`):** Before coding, the target website's DOM structure and behavior are analyzed and documented (e.g., `docs/genit-dom-analysis.md`). This informs implementation strategy.
2.  **Planning (`reviews/roadmap/`):** Each milestone's goals and tasks are clearly defined in markdown files.
3.  **Implementation (`src/`):** The actual coding happens in `src/gpi.user.js`.
4.  **Manual Testing:** Verification is done by manually installing and running the script on the live Genit website.

**Key Files:**

- `src/gpi.user.js`: The complete source code for the userscript.
- `reviews/roadmap/milestone1.md`: The plan and checklist for the first version of the editor.
- `docs/genit-dom-analysis.md`: The technical deep-dive on how the Genit website's frontend works, including stable selectors and methods for safe interaction with React.
- `example.md`: A detailed reference document outlining the complex structure and rules for a system prompt on the Genit platform. It serves as a sample of the content users will write in the IDE.
- `AGENTS.md`: Defines the project structure, coding style, and contribution guidelines for the multi-agent workflow.
