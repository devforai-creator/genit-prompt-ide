# Tampermonkey Prompt Injector Roadmap (Codex)

## Current Product Hypothesis (Persona)
- Primary: “뭐부터 해야 할지 모르겠는” 신규/막막한 크리에이터(온보딩, 기본 틀, 가이드가 핵심 가치).
- Secondary: “틀 한 번 잡고 복붙으로 졸업한” 사용자(Export/Import 같은 회수 기능은 수요 확인 후).
- Keep it flexible: 커뮤니티 피드백/투표에 따라 우선순위는 2~3주 단위로 조정한다.

## Vision
- Automate pasting `example.md` content into Genit character prompt input using Tampermonkey.
- Keep script resilient to DOM changes and provide easy toggles for future prompt variants.

## Open Questions
- Precise selector or identifier for the character prompt textarea in Genit.
- Whether the site enforces input length limits or sanitisation that might strip formatting.
- Need for localisation handling if the UI language or layout changes.

## Stepwise Plan
1. Inspect the live page, capture consistent selectors, and document fallbacks (querySelector chains, data attributes, or XPath).
2. Draft a minimal Tampermonkey script that injects `example.md` text on demand (button press or auto-fill) and logs success/failure in the console.
3. Add safety: confirmation modal, undo button, and guard clauses to avoid double-insertion.
4. Abstract the prompt payload into a template literal or external resource loader to allow multiple presets.
5. Package helper utilities (hotkeys, status banner) and write README instructions for installation and usage.
6. Regression checklist: verify script after Genit updates using MutationObserver-based alerts.

## Supporting Notes
- Prefer observing DOM mutations instead of polling to reduce CPU cost.
- Keep the prompt content in a separate module/file for easier updates and version control.
- Consider capturing the injected prompt version and timestamp in localStorage for debugging.
