# Repository Guidelines

## Project Structure & Module Organization
- `src/gpi.user.js`: Tampermonkey userscript; all feature work lives here for now.
- `docs/`: Reference material (e.g., `docs/genit-dom-analysis.md`) that informs DOM selectors and integration details.
- `reviews/roadmap/`: Planning notes per agent. Start here to understand milestones before coding.
- `example.md`: Prompt format reference; do not inject directly—treat as inspiration for user-authored prompts.

## Build, Test, and Development Commands
- `npm install` (optional): Sets up a local Node toolchain if you add bundlers or linters; not required today.
- `npm run lint`: Configure before use; placeholder for future ESLint/Prettier integration.
- Manual verification: Load `src/gpi.user.js` into Tampermonkey, visit `https://genit.ai/ko/create/content`, and exercise the popup across tab switches.

## Coding Style & Naming Conventions
- Language: vanilla ES2020+; prefer const/let, arrow functions, and template literals.
- Indent with two spaces; avoid tabs.
- Keep UI IDs/prefixes under the `gpi-` namespace; log messages prefixed with `[GPI]`.
- Inline CSS is acceptable inside the userscript; comment sparingly for non-obvious React interop.

## Testing Guidelines
- Primary coverage is manual UI testing in Chrome (baseline) and Firefox (secondary).
- Confirm: popup opens on prompt focus, Apply syncs React state, Cancel/overlay close works, drag bounds respected after window resize.
- Record edge cases in `reviews/roadmap/milestone1.md` until automated tests exist.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`); keep scope short (e.g., `feat: enhance prompt observer`).
- Include a succinct body describing motivation and testing evidence.
- PRs should: reference the relevant milestone, summarize functional impact, attach before/after screenshots or screencasts when UI changes occur, and list manual test steps.
- Avoid bundling unrelated roadmap updates with code changes; submit planning edits separately when possible.

## Security & Configuration Notes
- Never hardcode secrets; the script runs client-side and shares the browser context.
- Respect Genit CSP: limit `@grant` usage to what the feature needs, and document new permissions in the userscript header.
- Keep MutationObservers scoped to `document.body` and disconnect when the editor is removed to prevent leaks.
