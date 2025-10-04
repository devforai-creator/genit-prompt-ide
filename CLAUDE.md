# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**GPI (Genit Prompt IDE)** is a Tampermonkey userscript that provides a floating editor for managing complex system prompts on the Genit character chatbot platform (https://genit.ai).

**Key constraint**: No source code access or API available for Genit - all interaction happens through DOM manipulation via Tampermonkey.

---

## Core Architecture

### Single-File Design
The entire userscript is contained in `src/gpi.user.js` as a single self-contained IIFE. No build process, bundler, or external dependencies.

### Critical DOM Integration Pattern

Genit runs on React, so direct `textarea.value = ...` assignments won't trigger React's state updates. Always use this pattern:

```javascript
// 1. Use native setter to bypass React's property descriptor
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  'value'
).set;
nativeTextareaSetter.call(textarea, newValue);

// 2. Dispatch synthetic events for React to detect the change
textarea.dispatchEvent(new Event('input', { bubbles: true }));
textarea.dispatchEvent(new Event('change', { bubbles: true }));
```

### Selector Strategy (Fallback Chain)

Primary: `document.getElementById('character_prompt')`

Fallbacks (in order):
1. Label text matching (`이미지 호출` in previous sibling)
2. Placeholder attribute (`placeholder*="이미지"`)
3. First textarea (least stable)

See `docs/genit-dom-analysis.md` for full DOM structure details.

### Dynamic DOM Handling

Genit is a React SPA with dynamic rendering. The script uses `MutationObserver` to continuously watch for the prompt textarea:

```javascript
const observer = new MutationObserver(() => {
  refreshPromptReference(); // Re-attach listeners if DOM changes
});
observer.observe(document.body, { childList: true, subtree: true });
```

---

## State Management

Global state object tracks:
- `promptEl`: Reference to Genit's prompt textarea
- `overlay`: Semi-transparent backdrop element
- `editor`: Floating editor container
- `textarea`: Editor's internal textarea
- `dragAnchor`: Drag offset coordinates
- `openHandler`: Event listener reference (for cleanup)

**Important**: Clean up event listeners in `detachPromptListeners()` to prevent memory leaks when textarea re-renders.

---

## Testing the Script

### Installation
1. Install Tampermonkey browser extension
2. Copy contents of `src/gpi.user.js`
3. Paste into Tampermonkey dashboard → "Create new script"
4. Save (Ctrl+S)

### Manual Testing Checklist
Navigate to https://genit.ai/ko/create/content and verify:
- [ ] Script loads (check `[GPI] Userscript loaded` in console)
- [ ] Click on prompt textarea opens floating editor
- [ ] Editor shows existing content from textarea
- [ ] Dragging titlebar moves editor
- [ ] "적용" (Apply) button inserts text into original textarea
- [ ] "취소" (Cancel) / overlay click closes editor without changes
- [ ] Page refresh re-initializes script correctly

### Known Edge Cases
- **Dark mode**: UI uses dark theme by default (matches Genit)
- **Long prompts**: Tested up to 2000+ characters (see example.md)
- **React re-renders**: MutationObserver re-attaches listeners automatically

---

## Development Milestones

### Milestone 1 (Current - v0.1.0) ✅
Basic floating editor with drag, apply/cancel, React-safe insertion.

### Milestone 2 (Planned)
Multiple prompt presets with localStorage (`GM_setValue`/`GM_getValue`), preset list UI, favorites.

### Milestone 3 (Planned)
Syntax highlighting, variable substitution (`{{var}}`), character counter, validation.

### Milestone 4 (Planned)
Import/Export (JSON/MD), optional cloud sync, prompt sharing.

See `reviews/roadmap/` for detailed planning documents.

---

## Code Style & Constraints

- **No external dependencies**: Vanilla JS only
- **Inline styles**: All CSS via `element.style.*` (no separate stylesheet)
- **Namespacing**: All IDs/classes prefixed with `gpi-` to avoid conflicts
- **Logging**: Use `log()` helper for consistent console output format
- **License**: GPL-3.0 (all contributions must comply)

---

## Key Files

- `src/gpi.user.js`: Main userscript (only executable code)
- `docs/genit-dom-analysis.md`: Reverse-engineered DOM structure of Genit
- `example.md`: Sample prompt content (used for testing)
- `reviews/roadmap/milestone1.md`: Current milestone task breakdown

---

## Common Pitfalls

1. **Forgetting to trigger React events**: Always dispatch `input` + `change` after setting textarea value
2. **Using `node` attribute as selector**: This value changes on every page load (React internal)
3. **Not handling MutationObserver cleanup**: Can cause performance issues if observer isn't disconnected when textarea found
4. **Assuming `#character_prompt` always exists**: Use fallback selectors (see `findPromptTextarea()`)

---

## Collaboration Notes

This project was collaboratively developed by multiple AI agents:
- **AI Comet**: DOM analysis
- **Claude**: Documentation, architecture planning
- **Codex**: Implementation
- **소중한코알라5299**: Project lead, UX design

When making changes, update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com) format.
