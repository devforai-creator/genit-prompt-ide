// ==UserScript==
// @name         Genit Prompt IDE – Milestone 1
// @namespace    https://genit-prompt-ide.local
// @version      0.1.0
// @description  Adds a draggable popup editor for the Genit character prompt textarea.
// @author       Codex
// @match        https://genit.ai/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const PROMPT_SELECTOR = '#character_prompt';
  const TITLE = 'Genit Prompt IDE';
  const EDITOR_ID = 'gpi-editor-container';
  const OVERLAY_ID = 'gpi-overlay';
  const BUTTON_APPLY_ID = 'gpi-apply';
  const BUTTON_CANCEL_ID = 'gpi-cancel';
  const TEXTAREA_ID = 'gpi-editor-textarea';

  const state = {
    promptEl: null,
    overlay: null,
    editor: null,
    textarea: null,
    dragAnchor: null,
    openHandler: null,
  };

  const log = (...args) => console.log('[GPI]', ...args);

  // Use the native setter so React's synthetic events register the change.
  const setNativeValue = (element, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    );

    if (!descriptor?.set) {
      element.value = value;
      return;
    }

    descriptor.set.call(element, value);
  };

  const dispatchReactInputEvents = (element) => {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const findPromptTextarea = () => {
    const byId = document.querySelector(PROMPT_SELECTOR);
    if (byId) return byId;

    const byLabel = Array.from(document.querySelectorAll('textarea')).find((candidate) => {
      const labelText = candidate.previousElementSibling?.textContent || '';
      return labelText.includes('이미지 호출');
    });

    if (byLabel) return byLabel;

    return document.querySelector('textarea[placeholder*="이미지"]');
  };

  const detachPromptListeners = () => {
    if (state.promptEl && state.openHandler) {
      state.promptEl.removeEventListener('focus', state.openHandler);
      state.promptEl.removeEventListener('click', state.openHandler);
    }

    state.promptEl = null;
    state.openHandler = null;
  };

  const attachPromptListeners = (textarea) => {
    if (!(textarea instanceof HTMLTextAreaElement)) return;

    if (state.promptEl === textarea && state.openHandler && textarea.isConnected) {
      return;
    }

    detachPromptListeners();

    const handler = () => {
      state.promptEl = textarea;
      showEditor();
    };

    textarea.addEventListener('focus', handler);
    textarea.addEventListener('click', handler);

    state.promptEl = textarea;
    state.openHandler = handler;

    log('Prompt textarea listeners attached');
  };

  const ensureOverlay = () => {
    if (state.overlay) return state.overlay;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.55)';
    overlay.style.backdropFilter = 'blur(2px)';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'none';
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) {
        hideEditor();
      }
    });

    document.body.appendChild(overlay);
    state.overlay = overlay;
    return overlay;
  };

  const ensureEditor = () => {
    if (state.editor) return state.editor;

    const container = document.createElement('div');
    container.id = EDITOR_ID;
    container.style.position = 'fixed';
    container.style.top = '10%';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.width = 'min(720px, 90vw)';
    container.style.minHeight = '360px';
    container.style.maxHeight = '80vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.backgroundColor = '#0f172a';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 20px 60px rgba(15, 23, 42, 0.3)';
    container.style.color = '#f8fafc';
    container.style.fontFamily = 'ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    container.style.border = '1px solid rgba(148, 163, 184, 0.3)';

    const header = document.createElement('div');
    header.style.cursor = 'move';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '12px 16px';
    header.style.borderBottom = '1px solid rgba(148, 163, 184, 0.25)';
    header.style.userSelect = 'none';

    const title = document.createElement('span');
    title.textContent = TITLE;
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close editor');
    closeButton.style.width = '28px';
    closeButton.style.height = '28px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '6px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = 'inherit';
    closeButton.style.fontSize = '20px';
    closeButton.style.lineHeight = '1';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', hideEditor);

    header.addEventListener('mousedown', (event) => {
      startDrag(event, container);
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    const editorBody = document.createElement('div');
    editorBody.style.flex = '1';
    editorBody.style.display = 'flex';
    editorBody.style.padding = '16px';

    const textarea = document.createElement('textarea');
    textarea.id = TEXTAREA_ID;
    textarea.style.flex = '1';
    textarea.style.resize = 'none';
    textarea.style.width = '100%';
    textarea.style.height = '100%';
    textarea.style.backgroundColor = '#020617';
    textarea.style.color = '#e2e8f0';
    textarea.style.border = '1px solid rgba(148, 163, 184, 0.2)';
    textarea.style.borderRadius = '8px';
    textarea.style.padding = '12px';
    textarea.style.fontSize = '14px';
    textarea.style.lineHeight = '1.5';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'inset 0 0 0 1px rgba(148, 163, 184, 0.08)';

    editorBody.appendChild(textarea);

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.padding = '12px 16px 16px';
    footer.style.gap = '12px';

    const helper = document.createElement('span');
    helper.textContent = '팁: 수정 후 "적용"을 눌러 프롬프트 입력창에 반영하세요.';
    helper.style.fontSize = '12px';
    helper.style.color = 'rgba(226, 232, 240, 0.75)';
    helper.style.alignSelf = 'center';

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '8px';

    const createButton = (id, label, backgroundColor, color) => {
      const button = document.createElement('button');
      button.id = id;
      button.type = 'button';
      button.textContent = label;
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.padding = '10px 18px';
      button.style.fontSize = '14px';
      button.style.fontWeight = '600';
      button.style.cursor = 'pointer';
      button.style.backgroundColor = backgroundColor;
      button.style.color = color;
      button.addEventListener('mouseenter', () => {
        button.style.filter = 'brightness(1.1)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.filter = 'none';
      });
      return button;
    };

    const cancelButton = createButton(
      BUTTON_CANCEL_ID,
      '취소',
      'rgba(148, 163, 184, 0.2)',
      '#e2e8f0'
    );
    cancelButton.addEventListener('click', hideEditor);

    const applyButton = createButton(
      BUTTON_APPLY_ID,
      '적용',
      '#38bdf8',
      '#0f172a'
    );
    applyButton.addEventListener('click', () => {
      if (!state.promptEl) {
        hideEditor();
        return;
      }
      const value = textarea.value;
      setNativeValue(state.promptEl, value);
      dispatchReactInputEvents(state.promptEl);
      log('Prompt updated via editor');
      hideEditor();
    });

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(applyButton);

    footer.appendChild(helper);
    footer.appendChild(buttonGroup);

    container.appendChild(header);
    container.appendChild(editorBody);
    container.appendChild(footer);

    state.editor = container;
    state.textarea = textarea;

    ensureOverlay().appendChild(container);
    return container;
  };

  const showEditor = () => {
    ensureOverlay();
    ensureEditor();

    if (!state.overlay || !state.editor || !state.textarea || !state.promptEl) {
      log('Editor prerequisites missing');
      return;
    }

    state.textarea.value = state.promptEl.value;
    state.overlay.style.display = 'block';
    state.editor.style.display = 'flex';
    window.requestAnimationFrame(() => {
      state.textarea.focus({ preventScroll: false });
      state.textarea.setSelectionRange(
        state.textarea.value.length,
        state.textarea.value.length
      );
    });
  };

  const hideEditor = () => {
    if (!state.overlay || !state.editor) return;
    state.overlay.style.display = 'none';
    state.editor.style.display = 'none';
    state.dragAnchor = null;
  };

  const startDrag = (event, container) => {
    const isPrimaryButton = event.button === 0;
    if (!isPrimaryButton) return;

    const rect = container.getBoundingClientRect();
    state.dragAnchor = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', stopDrag);
  };

  // Clamp editor within viewport while dragging.
  const onDragMove = (event) => {
    if (!state.dragAnchor || !state.editor) return;

    const { offsetX, offsetY } = state.dragAnchor;
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;

    state.editor.style.left = `${Math.min(Math.max(x, 16), window.innerWidth - state.editor.offsetWidth - 16)}px`;
    state.editor.style.top = `${Math.min(Math.max(y, 16), window.innerHeight - state.editor.offsetHeight - 16)}px`;
    state.editor.style.transform = 'none';
  };

  const stopDrag = () => {
    state.dragAnchor = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', stopDrag);
  };

  const refreshPromptReference = () => {
    const prompt = findPromptTextarea();
    if (prompt) {
      attachPromptListeners(prompt);
    } else if (state.promptEl) {
      detachPromptListeners();
    }
  };

  const bootstrap = () => {
    refreshPromptReference();

    const observer = new MutationObserver(() => {
      refreshPromptReference();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  log('Userscript loaded');
})();
