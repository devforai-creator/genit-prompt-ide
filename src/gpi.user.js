// ==UserScript==
// @name         Genit Prompt IDE
// @namespace    https://genit-prompt-ide.local
// @version      0.2.0
// @description  Resizable, fullscreen-capable popup editor for Genit character prompts.
// @author       Codex
// @match        https://genit.ai/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

/* global GM_getValue, GM_setValue */

(function () {
  'use strict';

  const PROMPT_SELECTOR = '#character_prompt';
  const TITLE = 'Genit Prompt IDE';
  const EDITOR_ID = 'gpi-editor-container';
  const OVERLAY_ID = 'gpi-overlay';
  const BUTTON_APPLY_ID = 'gpi-apply';
  const BUTTON_CANCEL_ID = 'gpi-cancel';
  const BUTTON_FULLSCREEN_ID = 'gpi-fullscreen';
  const TEXTAREA_ID = 'gpi-editor-textarea';

  const MIN_WIDTH = 480;
  const MIN_HEIGHT = 320;

  const maxWidth = () => Math.min(1600, window.innerWidth - 32);
  const maxHeight = () => Math.min(Math.round(window.innerHeight * 0.95), window.innerHeight - 32);

  const defaultWidth = () => Math.max(Math.round(window.innerWidth * 0.85), MIN_WIDTH);
  const defaultHeight = () => Math.max(Math.round(window.innerHeight * 0.85), MIN_HEIGHT);

  const STORAGE_KEY = 'gpi_editorState';

  const gmGet = (key, fallback) => {
    try {
      return typeof GM_getValue === 'function' ? GM_getValue(key, fallback) : fallback;
    } catch (error) {
      log('GM_getValue error', error);
      return fallback;
    }
  };

  const gmSet = (key, value) => {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(key, value);
      }
    } catch (error) {
      log('GM_setValue error', error);
    }
  };

  const state = {
    promptEl: null,
    overlay: null,
    editor: null,
    textarea: null,
    dragAnchor: null,
    openHandler: null,
    header: null,
    footer: null,
    resizeAnchor: null,
    beforeFullscreen: null,
    isFullscreen: false,
    userSelectCache: '',
    suppressOverlayClose: false,
  };

  const loadEditorState = () => {
    try {
      const stored = gmGet(STORAGE_KEY, null);
      if (!stored) return null;
      const { width, height, top, left } = stored;
      if ([width, height, top, left].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
        return null;
      }
      return clampBounds({ width, height, top, left });
    } catch (error) {
      log('Failed to load editor state', error);
      return null;
    }
  };

  const persistEditorState = (bounds) => {
    const safeBounds = clampBounds(bounds);
    try {
      gmSet(STORAGE_KEY, safeBounds);
    } catch (error) {
      log('Failed to persist editor state', error);
    }
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

  const disableUserSelect = () => {
    state.userSelectCache = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
  };

  const restoreUserSelect = () => {
    document.body.style.userSelect = state.userSelectCache || '';
    state.userSelectCache = '';
  };

  const getEditorBounds = () => {
    if (!state.editor) return computeDefaultBounds();
    const rect = state.editor.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    };
  };

  const applyEditorBounds = ({ width, height, top, left }) => {
    if (!state.editor) return;
    const bounds = clampBounds({ width, height, top, left });
    state.editor.style.width = `${Math.round(bounds.width)}px`;
    state.editor.style.height = `${Math.round(bounds.height)}px`;
    state.editor.style.top = `${Math.round(bounds.top)}px`;
    state.editor.style.left = `${Math.round(bounds.left)}px`;
    state.editor.style.transform = 'none';
    updateTextareaLayout();
  };

  const ensureEditorBounds = () => {
    const stored = loadEditorState();
    if (stored) {
      applyEditorBounds(stored);
      return;
    }
    applyEditorBounds(computeDefaultBounds());
  };

  const updateTextareaLayout = () => {
    if (!state.editor || !state.textarea) return;
    const headerHeight = state.header?.offsetHeight ?? 0;
    const footerHeight = state.footer?.offsetHeight ?? 0;
    const available = state.editor.clientHeight - headerHeight - footerHeight - 24;
    state.textarea.style.height = `${Math.max(available, 160)}px`;
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

  const clampBounds = ({ width, height, top, left }) => {
    const boundedWidth = Math.min(Math.max(width, MIN_WIDTH), maxWidth());
    const boundedHeight = Math.min(Math.max(height, MIN_HEIGHT), maxHeight());
    const maxLeft = window.innerWidth - boundedWidth - 16;
    const maxTop = window.innerHeight - boundedHeight - 16;
    return {
      width: boundedWidth,
      height: boundedHeight,
      left: Math.min(Math.max(left, 16), Math.max(maxLeft, 16)),
      top: Math.min(Math.max(top, 16), Math.max(maxTop, 16)),
    };
  };

  const computeDefaultBounds = () => {
    const width = Math.min(defaultWidth(), maxWidth());
    const height = Math.min(defaultHeight(), maxHeight());
    const left = Math.max(Math.round((window.innerWidth - width) / 2), 16);
    const top = Math.max(Math.round((window.innerHeight - height) / 2), 16);
    return clampBounds({ width, height, top, left });
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
      if (evt.target !== overlay) return;
      if (state.dragAnchor || state.resizeAnchor || state.suppressOverlayClose) {
        state.suppressOverlayClose = false;
        return;
      }
      hideEditor();
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
    container.style.top = '0';
    container.style.left = '0';
    container.style.transform = 'none';
    container.style.minHeight = `${MIN_HEIGHT}px`;
    container.style.maxHeight = '95vh';
    container.style.minWidth = '0px';
    container.style.maxWidth = '1600px';
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

    const buttonBar = document.createElement('div');
    buttonBar.style.display = 'flex';
    buttonBar.style.alignItems = 'center';
    buttonBar.style.gap = '8px';

    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = BUTTON_FULLSCREEN_ID;
    fullscreenButton.type = 'button';
    fullscreenButton.textContent = '⛶';
    fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenButton.style.width = '28px';
    fullscreenButton.style.height = '28px';
    fullscreenButton.style.border = 'none';
    fullscreenButton.style.borderRadius = '6px';
    fullscreenButton.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
    fullscreenButton.style.color = 'inherit';
    fullscreenButton.style.fontSize = '16px';
    fullscreenButton.style.cursor = 'pointer';
    fullscreenButton.style.display = 'flex';
    fullscreenButton.style.alignItems = 'center';
    fullscreenButton.style.justifyContent = 'center';

    fullscreenButton.addEventListener('mouseenter', () => {
      fullscreenButton.style.filter = 'brightness(1.1)';
    });
    fullscreenButton.addEventListener('mouseleave', () => {
      fullscreenButton.style.filter = 'none';
    });

    fullscreenButton.addEventListener('click', toggleFullscreen);

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

    buttonBar.appendChild(fullscreenButton);
    buttonBar.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(buttonBar);

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

    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '16px';
    resizeHandle.style.height = '16px';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.6) 50%)';
    resizeHandle.style.borderBottomRightRadius = '12px';

    resizeHandle.addEventListener('mousedown', (event) => {
      startResize(event);
    });

    container.appendChild(header);
    container.appendChild(editorBody);
    container.appendChild(footer);
    container.appendChild(resizeHandle);

    state.editor = container;
    state.textarea = textarea;
    state.header = header;
    state.footer = footer;

    ensureOverlay().appendChild(container);
    ensureEditorBounds();
    updateFullscreenButton();
    return container;
  };

  const showEditor = () => {
    ensureOverlay();
    ensureEditor();

    if (!state.overlay || !state.editor || !state.textarea || !state.promptEl) {
      log('Editor prerequisites missing');
      return;
    }

    if (state.isFullscreen) {
      exitFullscreen();
    }

    ensureEditorBounds();
    state.textarea.value = state.promptEl.value;
    state.overlay.style.display = 'block';
    state.editor.style.display = 'flex';
    updateTextareaLayout();
    document.addEventListener('keydown', onKeydown, true);
    window.addEventListener('resize', onWindowResize);
    window.requestAnimationFrame(() => {
      updateTextareaLayout();
      state.textarea.focus({ preventScroll: false });
      state.textarea.setSelectionRange(
        state.textarea.value.length,
        state.textarea.value.length
      );
    });
  };

  const hideEditor = () => {
    if (!state.overlay || !state.editor) return;
    if (state.isFullscreen) {
      exitFullscreen();
    }
    const bounds = getEditorBounds();
    state.overlay.style.display = 'none';
    state.editor.style.display = 'none';
    state.dragAnchor = null;
    state.resizeAnchor = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', stopResize);
    restoreUserSelect();
    document.removeEventListener('keydown', onKeydown, true);
    window.removeEventListener('resize', onWindowResize);
    persistEditorState(bounds);
  };

  const startDrag = (event, container) => {
    if (state.isFullscreen || state.resizeAnchor) return;
    if (event.button !== 0) return;
    event.preventDefault();

    const rect = container.getBoundingClientRect();
    state.dragAnchor = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    state.suppressOverlayClose = true;
    disableUserSelect();
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
    if (!state.dragAnchor) return;
    state.dragAnchor = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', stopDrag);
    restoreUserSelect();
    persistEditorState(getEditorBounds());
    window.requestAnimationFrame(() => {
      state.suppressOverlayClose = false;
    });
  };

  const startResize = (event) => {
    if (state.isFullscreen || state.dragAnchor) return;
    if (event.button !== 0 || !state.editor) return;
    event.preventDefault();

    const rect = state.editor.getBoundingClientRect();
    state.resizeAnchor = {
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    };

    state.suppressOverlayClose = true;
    disableUserSelect();
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', stopResize);
  };

  const onResizeMove = (event) => {
    if (!state.resizeAnchor || !state.editor) return;

    const {
      startX,
      startY,
      width,
      height,
      top,
      left,
    } = state.resizeAnchor;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    const proposed = clampBounds({
      width: width + deltaX,
      height: height + deltaY,
      top,
      left,
    });

    applyEditorBounds(proposed);
  };

  const stopResize = () => {
    if (!state.resizeAnchor) return;
    state.resizeAnchor = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', stopResize);
    restoreUserSelect();
    persistEditorState(getEditorBounds());
    window.requestAnimationFrame(() => {
      state.suppressOverlayClose = false;
    });
  };

  const updateFullscreenButton = () => {
    const button = document.getElementById(BUTTON_FULLSCREEN_ID);
    if (!button) return;
    if (state.isFullscreen) {
      button.style.backgroundColor = '#38bdf8';
      button.style.color = '#0f172a';
      button.title = '전체화면 종료 (ESC)';
    } else {
      button.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
      button.style.color = '#f8fafc';
      button.title = '전체화면 (ESC로 종료)';
    }
  };

  const applyFullscreenBounds = () => {
    if (!state.editor) return;
    state.editor.style.maxWidth = 'none';
    state.editor.style.maxHeight = 'none';
    state.editor.style.width = `${window.innerWidth}px`;
    state.editor.style.height = `${window.innerHeight}px`;
    state.editor.style.top = '0px';
    state.editor.style.left = '0px';
    state.editor.style.transform = 'none';
    updateTextareaLayout();
  };

  const enterFullscreen = () => {
    if (state.isFullscreen || !state.editor) return;
    state.beforeFullscreen = {
      ...getEditorBounds(),
      maxWidth: state.editor.style.maxWidth,
      maxHeight: state.editor.style.maxHeight,
    };
    state.isFullscreen = true;
    applyFullscreenBounds();
    updateFullscreenButton();
    window.requestAnimationFrame(() => {
      state.textarea?.focus();
    });
  };

  const exitFullscreen = () => {
    if (!state.isFullscreen) return;
    const fallback = computeDefaultBounds();
    const bounds = state.beforeFullscreen ? clampBounds(state.beforeFullscreen) : fallback;
    if (state.editor) {
      state.editor.style.maxWidth = state.beforeFullscreen?.maxWidth || '1600px';
      state.editor.style.maxHeight = state.beforeFullscreen?.maxHeight || '95vh';
    }
    state.isFullscreen = false;
    state.beforeFullscreen = null;
    applyEditorBounds(bounds);
    updateFullscreenButton();
    persistEditorState(bounds);
    window.requestAnimationFrame(() => {
      state.textarea?.focus();
    });
  };

  const toggleFullscreen = () => {
    if (state.isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape' && state.isFullscreen) {
      event.preventDefault();
      exitFullscreen();
    }
  };

  const onWindowResize = () => {
    if (!state.editor || state.overlay?.style.display !== 'block') return;
    if (state.dragAnchor || state.resizeAnchor) return;
    if (state.isFullscreen) {
      applyFullscreenBounds();
      return;
    }
    const bounds = clampBounds(getEditorBounds());
    applyEditorBounds(bounds);
    persistEditorState(bounds);
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
