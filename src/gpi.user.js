// ==UserScript==
// @name         Genit Prompt IDE
// @namespace    https://genit-prompt-ide.local
// @version      1.1.0
// @description  Prompt editor with one-click template blocks for Genit character creation.
// @author       Codex
// @match        https://genit.ai/*
// @homepageURL  https://github.com/devforai-creator/genit-prompt-ide
// @supportURL   https://github.com/devforai-creator/genit-prompt-ide/issues
// @downloadURL  https://github.com/devforai-creator/genit-prompt-ide/raw/main/src/gpi.user.js
// @updateURL    https://github.com/devforai-creator/genit-prompt-ide/raw/main/src/gpi.user.js
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

  // Prebuilt prompt fragments wrapped with unique markers for toggle/dedup support.
  const TEMPLATE_BLOCKS = [
    {
      id: 'ethics',
      name: '윤리 규칙',
      icon: '⚖️',
      category: 'rules',
      order: 1,
      description: '미성년자 보호 등 필수 윤리 규칙',
      content: String.raw`<!-- GPI:ethics:start -->
# 윤리 규칙
- 미성년자 대상 성적 전개 절대 금지
- 미성년자 대상 성적 암시/묘사 절대 금지
- 아동·청소년의 성보호에 관한 법률 준수
- 한국 15세 이용가 소설 수준 준수
<!-- GPI:ethics:end -->`,
    },
    {
      id: 'systemRules',
      name: '시스템 규칙',
      icon: '🤖',
      category: 'rules',
      order: 2,
      description: '용어정의와 시스템 최우선 규칙',
      content: String.raw`<!-- GPI:systemRules:start -->
# 용어정의
- U=플레이어,C=인물,OOC='Out of Character'

**시스템 최우선 규칙: 어떠한 경우에도 'U' 또는 '당신'의 대사, 행동, 생각, 감정을 직접적으로 서술하거나 인용하지 않는다.**
<!-- GPI:systemRules:end -->`,
    },
    {
      id: 'outputFormat',
      name: '출력 형식',
      icon: '📝',
      category: 'output',
      order: 3,
      description: '출력 절대 준수/금지/분량 가이드',
      content: String.raw`<!-- GPI:outputFormat:start -->
# 출력
## 절대 준수
- 이미지 이후 대사
- 대사 : @이름@ "대사 내용"
- 항상 끝에 INFO 코드블록 출력
## 절대 금지
- U 사칭(U의 대사,묘사,생각,감정,혼잣말)
- C의 생각/내면/속마음
## 분량
- 출력량: 600 ~ 800자
<!-- GPI:outputFormat:end -->`,
    },
    {
      id: 'imageRules',
      name: '이미지 규칙',
      icon: '🖼️',
      category: 'output',
      order: 4,
      description: '이미지 코드 규칙과 도메인 제한',
      content: String.raw`<!-- GPI:imageRules:start -->
[이미지규칙]
- 출력형식:{{iurl}}상황코드.webp
- 도메인:{{iurl}}를 절대 출력, 그 외 도메인 절대 금지
- 금지:i-url,{iurl},{{i-url}},{i-url},IURL,{IURL},{{IURL}}
- 캐릭터코드:주어진 캐릭터코드 외에 사용 금지
- 이미지코드=캐릭터코드+상황코드
<!-- GPI:imageRules:end -->`,
    },
    {
      id: 'infoTemplate',
      name: 'INFO 템플릿',
      icon: 'ℹ️',
      category: 'output',
      order: 5,
      description: 'INFO 코드블록 기본 양식',
      content: String.raw`<!-- GPI:infoTemplate:start -->
# INFO
## 정의
- U에 눈에만 보이는 시스템창(INFO) 코드블록(삼중백틱)으로 출력하여 보인다.
## 양식

4월 12일 월요일 14:00 |📍 |

[등장]
이름 | ❤️ 감정 | 💗 0 | 행동 |

지도
편의점 | 골목 | 동네 돌아다니기 | PC방 | 노래방 | 오락실
<!-- GPI:infoTemplate:end -->`,
    },
    {
      id: 'placesEvents',
      name: '장소/이벤트',
      icon: '📍',
      category: 'structure',
      order: 6,
      description: '장소별 이벤트/트리거 설계 템플릿',
      content: String.raw`<!-- GPI:placesEvents:start -->
# 장소 / 이벤트 설계

## 장소 목록
- [ ] 장소 1:
- [ ] 장소 2:
- [ ] 장소 3:

## 장소별 이벤트(트리거/결과)
- 장소 1
  - 트리거: (예: U가 처음 방문 / 특정 시간 / 특정 아이템)
  - 이벤트: (무슨 일이 일어남)
  - 결과: (관계/상태/아이템/정보 변화)
- 장소 2
  - 트리거:
  - 이벤트:
  - 결과:

## 반복 이벤트/랜덤 이벤트
- 반복: (예: 매일 아침, 주말, 비 오는 날)
- 랜덤: (예: 확률 20%로 발생)
<!-- GPI:placesEvents:end -->`,
    },
    {
      id: 'statsSystem',
      name: '수치 시스템',
      icon: '📊',
      category: 'structure',
      order: 7,
      description: '스탯/상태/호감도 등 수치 템플릿',
      content: String.raw`<!-- GPI:statsSystem:start -->
# 수치 시스템

## 핵심 수치(0~100)
- ❤️ 호감도: 0
- 💗 친밀도: 0
- ⚡ 기력: 100

## 상태(토글)
- [ ] 부상
- [ ] 피로
- [ ] 긴장
- [ ] 중독

## 변화 규칙(예시)
- 좋은 선택 +5~+15 / 나쁜 선택 -5~-15
- 임계점: 20/50/80에서 이벤트/대사 변화
- 기력 0이면: 행동 제한/강제 휴식

## INFO 반영 예시
- INFO의 “감정/수치/행동” 칸에 위 수치를 반영해서 출력
<!-- GPI:statsSystem:end -->`,
    },
  ];

  const getTemplateContent = (id) => {
    const block = TEMPLATE_BLOCKS.find((candidate) => candidate.id === id);
    return block?.content ?? '';
  };

  const defaultWizardData = () => ({
    world: {
      typeOption: 'school',
      typeCustom: '',
      specialRules: '',
      playerRoleOption: 'student',
      playerRoleCustom: '',
      locations: '',
    },
    character: {
      name: '',
      roleOption: 'friend',
      roleCustom: '',
      traits: '',
      address: '너',
      speechLevel: 'banmal',
      imageCode: '',
    },
  });

  const WORLD_TYPE_LABELS = {
    school: '학교/일상',
    fantasy: '판타지',
    city: '현대 도시',
  };

  const PLAYER_ROLE_LABELS = {
    student: '평범한 학생',
    amnesia: '기억을 잃은 채 깨어남',
    hiddenPower: '특별한 능력을 숨기고 있음',
  };

  const CHARACTER_ROLE_LABELS = {
    friend: '여사친/남사친',
    rival: '라이벌',
    mentor: '스승',
  };

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
    templateBar: null,
    resizeAnchor: null,
    beforeFullscreen: null,
    isFullscreen: false,
    userSelectCache: '',
    suppressOverlayClose: false,
    templateButtons: new Map(),
    insertedBlocks: new Set(),
    programmaticChange: false,
    inputListener: null,
    wizardActive: false,
    wizardOverlay: null,
    wizardModal: null,
    wizardContent: null,
    wizardFooter: null,
    wizardStepLabel: null,
    wizardStep: 1,
    wizardData: defaultWizardData(),
    wizardPreviewText: '',
    wizardFormRefs: null,
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

  const debounce = (fn, delay = 200) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const escapeRegExp = (input) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getBlockMarkers = (block) => ({
    start: `<!-- GPI:${block.id}:start -->`,
    end: `<!-- GPI:${block.id}:end -->`,
  });

  const createBlockRegex = (block) => {
    const { start, end } = getBlockMarkers(block);
    return new RegExp(`\n{0,2}${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\n{0,2}`, 'g');
  };

  const hasBlock = (value, block) => {
    const { start, end } = getBlockMarkers(block);
    return value.includes(start) && value.includes(end);
  };

  const normalizeBlockSpacing = (value) => {
    let next = value.replace(/\n{3,}/g, '\n\n');
    next = next.replace(/^\s*\n/, '');
    next = next.replace(/\n\s*$/, '\n');
    return next;
  };

  const runProgrammaticChange = (fn) => {
    state.programmaticChange = true;
    try {
      fn();
    } finally {
      state.programmaticChange = false;
    }
  };

  const updateButtonStates = () => {
    state.templateButtons.forEach((button, id) => {
      const active = state.insertedBlocks.has(id);
      button.setAttribute('aria-pressed', String(active));
      button.style.backgroundColor = active ? '#38bdf8' : 'rgba(148, 163, 184, 0.15)';
      button.style.color = active ? '#0f172a' : '#f8fafc';
      if (active) {
        button.style.filter = 'none';
      }
    });
  };

  const scanInsertedBlocks = () => {
    if (!state.textarea) return;
    state.insertedBlocks.clear();
    const value = state.textarea.value;
    TEMPLATE_BLOCKS.forEach((block) => {
      if (hasBlock(value, block)) {
        state.insertedBlocks.add(block.id);
      }
    });
    updateButtonStates();
  };

  const ensureSeparation = (before, after) => {
    const hasLeadingNewline = /\n\s*$/.test(before);
    const hasTrailingNewline = /^\s*\n/.test(after);
    const leading = before.length === 0 ? '' : hasLeadingNewline ? '' : '\n\n';
    const trailing = after.length === 0 ? '\n' : hasTrailingNewline ? '' : '\n\n';
    return { leading, trailing };
  };

  const insertBlock = (block) => {
    if (!state.textarea) return;
    const textarea = state.textarea;
    const { selectionStart, selectionEnd, value } = textarea;
    if (hasBlock(value, block)) return;

    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const { leading, trailing } = ensureSeparation(before, after);
    const insertion = `${leading}${block.content}${trailing}`;

    runProgrammaticChange(() => {
      setNativeValue(textarea, `${before}${insertion}${after}`);
      const cursor = before.length + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
      dispatchReactInputEvents(textarea);
    });

    state.insertedBlocks.add(block.id);
    updateButtonStates();
    updateTextareaLayout();
  };

  const removeBlock = (block) => {
    if (!state.textarea) return;
    const textarea = state.textarea;
    const markers = getBlockMarkers(block);
    if (!textarea.value.includes(markers.start)) return;
    const regex = createBlockRegex(block);

    const cursorPosition = textarea.selectionStart;
    const nextValue = normalizeBlockSpacing(textarea.value.replace(regex, '\n'));

    runProgrammaticChange(() => {
      setNativeValue(textarea, nextValue);
      const cursor = Math.min(cursorPosition, textarea.value.length);
      textarea.setSelectionRange(cursor, cursor);
      dispatchReactInputEvents(textarea);
    });

    state.insertedBlocks.delete(block.id);
    updateButtonStates();
    updateTextareaLayout();
  };

  const toggleBlock = (block) => {
    if (state.insertedBlocks.has(block.id)) {
      removeBlock(block);
    } else {
      insertBlock(block);
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

  const buildInfoBlock = (locations) => {
    const locationLine = locations.length ? locations.join(' | ') : '편의점 | 골목 | PC방 | 노래방';
    return String.raw`<!-- GPI:infoTemplate:start -->
# INFO
## 정의
- U에 눈에만 보이는 시스템창(INFO) 코드블록(삼중백틱)으로 출력하여 보인다.
## 양식

4월 12일 월요일 14:00 |📍 |

[등장]
이름 | ❤️ 감정 | 💗 0 | 행동 |

지도
${locationLine}
<!-- GPI:infoTemplate:end -->`;
  };

  const formatBulletList = (items, indent = '') => {
    return items.map((item) => `${indent}- ${item}`).join('\n');
  };

  const buildWizardPrompt = () => {
    const data = state.wizardData ?? defaultWizardData();
    const world = data.world;
    const character = data.character;

    const worldType = world.typeOption === 'custom'
      ? world.typeCustom.trim()
      : WORLD_TYPE_LABELS[world.typeOption] ?? world.typeOption;

    const playerRole = world.playerRoleOption === 'custom'
      ? world.playerRoleCustom.trim()
      : PLAYER_ROLE_LABELS[world.playerRoleOption] ?? world.playerRoleOption;

    const characterRole = character.roleOption === 'custom'
      ? character.roleCustom.trim()
      : CHARACTER_ROLE_LABELS[character.roleOption] ?? character.roleOption;

    const specialRules = world.specialRules
      .split('\n')
      .map((rule) => rule.trim())
      .filter(Boolean);

    const locations = world.locations
      .split(',')
      .map((loc) => loc.trim())
      .filter(Boolean);

    const traits = character.traits
      .split(',')
      .map((trait) => trait.trim())
      .filter(Boolean);

    const speechLabel = character.speechLevel === 'jondaemal' ? '존댓말' : '반말';
    const imageCode = character.imageCode.trim().toUpperCase();

    const sections = [];

    ['ethics', 'systemRules', 'outputFormat', 'imageRules'].forEach((id) => {
      const content = getTemplateContent(id);
      if (content) {
        sections.push(content);
      }
    });

    const worldLines = [`# 작품`, `- 설명: ${worldType || '세계관을 소개해주세요'}`];
    if (playerRole) {
      worldLines.push(`- 플레이어 설정: ${playerRole}`);
    }
    if (specialRules.length) {
      worldLines.push('- 특별 규칙:');
      worldLines.push(formatBulletList(specialRules, '  '));
    }
    if (locations.length) {
      worldLines.push('- 주요 장소:');
      worldLines.push(formatBulletList(locations, '  '));
    }
    sections.push(worldLines.join('\n'));

    const characterLines = [`# 인물`, `## ${character.name}`];
    if (characterRole) {
      characterLines.push(`- 역할: ${characterRole}`);
    }
    if (traits.length) {
      characterLines.push(`- 성격: ${traits.join(', ')}`);
    }
    if (character.address) {
      characterLines.push(`- 플레이어 호칭: ${character.address}`);
    }
    characterLines.push(`- 말투: ${speechLabel}`);
    sections.push(characterLines.join('\n'));

    if (character.name && imageCode) {
      sections.push(`#캐릭터코드\n${character.name}=${imageCode}_`);
    }

    sections.push(buildInfoBlock(locations));

    return sections.filter(Boolean).join('\n\n').trim();
  };

  const normalizeImageCode = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const isValidImageCode = (value) => /^(?:[A-Z]{3}|[0-9]{3})$/.test(value);

  const ensureWizardStructure = () => {
    if (state.wizardOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'gpi-wizard-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
    overlay.style.backdropFilter = 'blur(2px)';
    overlay.style.display = 'none';
    overlay.style.zIndex = '2147483648';
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeWizard();
      }
    });

    const modal = document.createElement('div');
    modal.id = 'gpi-wizard-modal';
    modal.style.position = 'absolute';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.width = 'min(820px, 90vw)';
    modal.style.maxHeight = '80vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.backgroundColor = '#0f172a';
    modal.style.borderRadius = '12px';
    modal.style.border = '1px solid rgba(148, 163, 184, 0.35)';
    modal.style.boxShadow = '0 24px 60px rgba(15, 23, 42, 0.45)';
    modal.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '16px 20px';
    header.style.borderBottom = '1px solid rgba(148, 163, 184, 0.3)';

    const title = document.createElement('div');
    title.textContent = '🧙 프롬프트 마법사';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    title.style.color = '#f8fafc';

    const headerRight = document.createElement('div');
    headerRight.style.display = 'flex';
    headerRight.style.alignItems = 'center';
    headerRight.style.gap = '12px';

    const stepLabel = document.createElement('span');
    stepLabel.style.fontSize = '13px';
    stepLabel.style.color = 'rgba(226, 232, 240, 0.7)';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', '마법사 닫기');
    closeButton.style.width = '32px';
    closeButton.style.height = '32px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '8px';
    closeButton.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
    closeButton.style.color = '#f8fafc';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
      closeWizard();
    });

    headerRight.appendChild(stepLabel);
    headerRight.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(headerRight);

    const content = document.createElement('div');
    content.className = 'gpi-wizard-content';
    content.style.flex = '1';
    content.style.overflow = 'auto';
    content.style.padding = '20px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '16px';
    content.style.color = '#e2e8f0';
    content.style.fontSize = '14px';
    content.style.lineHeight = '1.6';

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.padding = '16px 20px';
    footer.style.borderTop = '1px solid rgba(148, 163, 184, 0.25)';
    footer.style.gap = '12px';

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    state.wizardOverlay = overlay;
    state.wizardModal = modal;
    state.wizardContent = content;
    state.wizardFooter = footer;
    state.wizardStepLabel = stepLabel;
  };

  const resetWizardFormRefs = () => {
    state.wizardFormRefs = null;
  };

  const openWizard = () => {
    if (!state.textarea) return;
    if (state.wizardActive) {
      state.wizardStep = 1;
      renderWizardStep();
      return;
    }
    ensureWizardStructure();
    state.wizardOverlay.style.display = 'block';
    state.wizardModal.style.display = 'flex';
    state.wizardActive = true;
    state.wizardStep = 1;
    if (!state.wizardData) {
      state.wizardData = defaultWizardData();
    }
    renderWizardStep();
  };

  const closeWizard = () => {
    if (!state.wizardOverlay) return;
    state.wizardOverlay.style.display = 'none';
    state.wizardActive = false;
    state.wizardStep = 1;
    resetWizardFormRefs();
  };

  const setFieldError = (errorEl, message) => {
    if (!errorEl) return;
    errorEl.textContent = message ?? '';
  };

  const createSection = (title) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '8px';

    const heading = document.createElement('h3');
    heading.textContent = title;
    heading.style.margin = '0';
    heading.style.fontSize = '15px';
    heading.style.color = '#f8fafc';
    heading.style.fontWeight = '600';

    wrapper.appendChild(heading);
    return wrapper;
  };

  const createRadioField = (name, options, selectedValue, customValue, placeholder) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '8px';

    const radiosContainer = document.createElement('div');
    radiosContainer.style.display = 'flex';
    radiosContainer.style.flexWrap = 'wrap';
    radiosContainer.style.gap = '12px';

    const radioRefs = [];
    let customInput = null;

    options.forEach((option) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.cursor = 'pointer';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = option.value;
      input.checked = option.value === selectedValue;

      label.appendChild(input);
      label.append(option.label);

      radioRefs.push(input);
      radiosContainer.appendChild(label);

      if (option.value === 'custom') {
        const customWrapper = document.createElement('div');
        customWrapper.style.display = input.checked ? 'block' : 'none';
        customWrapper.style.marginLeft = '24px';

        const customField = document.createElement('input');
        customField.type = 'text';
        customField.placeholder = placeholder;
        customField.value = customValue;
        customField.style.width = '100%';
        customField.style.padding = '10px 12px';
        customField.style.borderRadius = '8px';
        customField.style.border = '1px solid rgba(148, 163, 184, 0.4)';
        customField.style.backgroundColor = '#020617';
        customField.style.color = '#f8fafc';

        customWrapper.appendChild(customField);
        wrapper.appendChild(customWrapper);

        input.addEventListener('change', () => {
          customWrapper.style.display = input.checked ? 'block' : 'none';
          if (input.checked) {
            customField.focus();
          }
        });

        customInput = customField;
      } else {
        input.addEventListener('change', () => {
          if (customInput) {
            customInput.parentElement.style.display = 'none';
          }
        });
      }
    });

    wrapper.appendChild(radiosContainer);

    return { wrapper, radioRefs, customInput };
  };

  const renderWorldStep = () => {
    const content = state.wizardContent;
    content.innerHTML = '';
    resetWizardFormRefs();

    const worldData = state.wizardData.world;
    const refs = {
      typeRadios: [],
      typeCustom: null,
      typeError: null,
      specialRules: null,
      playerRadios: [],
      playerCustom: null,
      playerError: null,
      locations: null,
      locationsError: null,
    };

    const section = createSection('세계관 설정');

    // Q1: 세계관 유형
    const q1 = document.createElement('div');
    q1.style.display = 'flex';
    q1.style.flexDirection = 'column';
    q1.style.gap = '6px';

    const q1Label = document.createElement('span');
    q1Label.textContent = '세계관 유형은?';
    q1Label.style.fontWeight = '500';
    q1.appendChild(q1Label);

    const { wrapper: q1Wrapper, radioRefs: typeRadios, customInput: typeCustom } = createRadioField(
      'gpi-wizard-world-type',
      [
        { value: 'school', label: '학교/일상' },
        { value: 'fantasy', label: '판타지' },
        { value: 'city', label: '현대 도시' },
        { value: 'custom', label: '직접 입력' },
      ],
      worldData.typeOption,
      worldData.typeCustom,
      '예: 사이버펑크 미래의 뒷골목'
    );

    typeRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        setFieldError(refs.typeError, '');
      });
    });

    refs.typeRadios = typeRadios;
    refs.typeCustom = typeCustom;

    q1.appendChild(q1Wrapper);
    const q1Error = document.createElement('div');
    q1Error.style.fontSize = '12px';
    q1Error.style.color = '#f87171';
    refs.typeError = q1Error;
    q1.appendChild(q1Error);

    section.appendChild(q1);

    // Q2: 특별 규칙
    const q2 = document.createElement('div');
    q2.style.display = 'flex';
    q2.style.flexDirection = 'column';
    q2.style.gap = '6px';

    const q2Label = document.createElement('span');
    q2Label.innerHTML = '특별한 규칙이 있나요? <span style="color:rgba(226,232,240,0.6);">(선택)</span>';
    q2Label.style.fontWeight = '500';
    q2.appendChild(q2Label);

    const specialRules = document.createElement('textarea');
    specialRules.rows = 4;
    specialRules.placeholder = '예: 마나는 1~10으로 측정되며, 3 이하면 입학 불가';
    specialRules.value = worldData.specialRules;
    specialRules.style.resize = 'vertical';
    specialRules.style.padding = '12px';
    specialRules.style.borderRadius = '8px';
    specialRules.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    specialRules.style.backgroundColor = '#020617';
    specialRules.style.color = '#f8fafc';

    refs.specialRules = specialRules;
    q2.appendChild(specialRules);

    section.appendChild(q2);

    // Q3: 플레이어 역할
    const q3 = document.createElement('div');
    q3.style.display = 'flex';
    q3.style.flexDirection = 'column';
    q3.style.gap = '6px';

    const q3Label = document.createElement('span');
    q3Label.textContent = '플레이어는 어떤 존재인가요?';
    q3Label.style.fontWeight = '500';
    q3.appendChild(q3Label);

    const { wrapper: q3Wrapper, radioRefs: playerRadios, customInput: playerCustom } = createRadioField(
      'gpi-wizard-player-role',
      [
        { value: 'student', label: '평범한 학생' },
        { value: 'amnesia', label: '기억 상실' },
        { value: 'hiddenPower', label: '특별한 능력 숨김' },
        { value: 'custom', label: '직접 입력' },
      ],
      worldData.playerRoleOption,
      worldData.playerRoleCustom,
      '예: 왕좌 계승권을 노리는 귀족'
    );

    playerRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        setFieldError(refs.playerError, '');
      });
    });

    refs.playerRadios = playerRadios;
    refs.playerCustom = playerCustom;

    q3.appendChild(q3Wrapper);
    const q3Error = document.createElement('div');
    q3Error.style.fontSize = '12px';
    q3Error.style.color = '#f87171';
    refs.playerError = q3Error;
    q3.appendChild(q3Error);

    section.appendChild(q3);

    // Q4: 주요 장소
    const q4 = document.createElement('div');
    q4.style.display = 'flex';
    q4.style.flexDirection = 'column';
    q4.style.gap = '6px';

    const q4Label = document.createElement('span');
    q4Label.innerHTML = '주요 장소는? <span style="color:rgba(226,232,240,0.6);">(쉼표로 구분, INFO 지도에 표시됩니다)</span>';
    q4Label.style.fontWeight = '500';
    q4.appendChild(q4Label);

    const locations = document.createElement('input');
    locations.type = 'text';
    locations.placeholder = '예: 편의점, 골목, PC방, 노래방';
    locations.value = worldData.locations;
    locations.style.width = '100%';
    locations.style.padding = '10px 12px';
    locations.style.borderRadius = '8px';
    locations.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    locations.style.backgroundColor = '#020617';
    locations.style.color = '#f8fafc';
    locations.addEventListener('input', () => {
      setFieldError(refs.locationsError, '');
    });

    refs.locations = locations;
    q4.appendChild(locations);

    const q4Error = document.createElement('div');
    q4Error.style.fontSize = '12px';
    q4Error.style.color = '#f87171';
    refs.locationsError = q4Error;
    q4.appendChild(q4Error);

    section.appendChild(q4);

    content.appendChild(section);

    state.wizardFormRefs = { world: refs };
  };

  const renderCharacterStep = () => {
    const content = state.wizardContent;
    content.innerHTML = '';
    resetWizardFormRefs();

    const charData = state.wizardData.character;
    const refs = {
      name: null,
      nameError: null,
      roleRadios: [],
      roleCustom: null,
      roleError: null,
      traits: null,
      traitsError: null,
      address: null,
      speechRadios: [],
      imageCode: null,
      imageError: null,
    };

    const section = createSection('핵심 인물');

    // 이름
    const nameField = document.createElement('div');
    nameField.style.display = 'flex';
    nameField.style.flexDirection = 'column';
    nameField.style.gap = '6px';

    const nameLabel = document.createElement('span');
    nameLabel.textContent = '이름은?';
    nameLabel.style.fontWeight = '500';
    nameField.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '예: 제니';
    nameInput.value = charData.name;
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px 12px';
    nameInput.style.borderRadius = '8px';
    nameInput.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    nameInput.style.backgroundColor = '#020617';
    nameInput.style.color = '#f8fafc';
    nameInput.addEventListener('input', () => {
      setFieldError(refs.nameError, '');
    });

    refs.name = nameInput;
    nameField.appendChild(nameInput);

    const nameError = document.createElement('div');
    nameError.style.fontSize = '12px';
    nameError.style.color = '#f87171';
    refs.nameError = nameError;
    nameField.appendChild(nameError);

    section.appendChild(nameField);

    // 역할
    const roleField = document.createElement('div');
    roleField.style.display = 'flex';
    roleField.style.flexDirection = 'column';
    roleField.style.gap = '6px';

    const roleLabel = document.createElement('span');
    roleLabel.textContent = '역할/직책은?';
    roleLabel.style.fontWeight = '500';
    roleField.appendChild(roleLabel);

    const { wrapper: roleWrapper, radioRefs: roleRadios, customInput: roleCustom } = createRadioField(
      'gpi-wizard-character-role',
      [
        { value: 'friend', label: '여사친/남사친' },
        { value: 'rival', label: '라이벌' },
        { value: 'mentor', label: '스승' },
        { value: 'custom', label: '직접 입력' },
      ],
      charData.roleOption,
      charData.roleCustom,
      '예: 정보 브로커'
    );

    roleRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        setFieldError(refs.roleError, '');
      });
    });

    refs.roleRadios = roleRadios;
    refs.roleCustom = roleCustom;

    roleField.appendChild(roleWrapper);

    const roleError = document.createElement('div');
    roleError.style.fontSize = '12px';
    roleError.style.color = '#f87171';
    refs.roleError = roleError;
    roleField.appendChild(roleError);

    section.appendChild(roleField);

    // 성격/특징
    const traitsField = document.createElement('div');
    traitsField.style.display = 'flex';
    traitsField.style.flexDirection = 'column';
    traitsField.style.gap = '6px';

    const traitsLabel = document.createElement('span');
    traitsLabel.textContent = '성격/특징은? (쉼표로 구분)';
    traitsLabel.style.fontWeight = '500';
    traitsField.appendChild(traitsLabel);

    const traitsInput = document.createElement('input');
    traitsInput.type = 'text';
    traitsInput.placeholder = '예: 친근함, 장난스러움, 밝음';
    traitsInput.value = charData.traits;
    traitsInput.style.width = '100%';
    traitsInput.style.padding = '10px 12px';
    traitsInput.style.borderRadius = '8px';
    traitsInput.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    traitsInput.style.backgroundColor = '#020617';
    traitsInput.style.color = '#f8fafc';
    traitsInput.addEventListener('input', () => {
      setFieldError(refs.traitsError, '');
    });

    refs.traits = traitsInput;
    traitsField.appendChild(traitsInput);

    const traitsError = document.createElement('div');
    traitsError.style.fontSize = '12px';
    traitsError.style.color = '#f87171';
    refs.traitsError = traitsError;
    traitsField.appendChild(traitsError);

    section.appendChild(traitsField);

    // 호칭 & 말투
    const addressField = document.createElement('div');
    addressField.style.display = 'flex';
    addressField.style.flexDirection = 'column';
    addressField.style.gap = '6px';

    const addressLabel = document.createElement('span');
    addressLabel.textContent = '플레이어를 어떻게 부르나요? 말투는?';
    addressLabel.style.fontWeight = '500';
    addressField.appendChild(addressLabel);

    const addressInput = document.createElement('input');
    addressInput.type = 'text';
    addressInput.placeholder = '예: 너';
    addressInput.value = charData.address;
    addressInput.style.width = '100%';
    addressInput.style.padding = '10px 12px';
    addressInput.style.borderRadius = '8px';
    addressInput.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    addressInput.style.backgroundColor = '#020617';
    addressInput.style.color = '#f8fafc';

    refs.address = addressInput;
    addressField.appendChild(addressInput);

    const speechWrap = document.createElement('div');
    speechWrap.style.display = 'flex';
    speechWrap.style.gap = '12px';
    speechWrap.style.marginTop = '4px';

    ['banmal', 'jondaemal'].forEach((value) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.cursor = 'pointer';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'gpi-wizard-speech-level';
      input.value = value;
      input.checked = charData.speechLevel === value;

      label.appendChild(input);
      label.append(value === 'banmal' ? '반말' : '존댓말');
      speechWrap.appendChild(label);

      refs.speechRadios.push(input);
    });

    addressField.appendChild(speechWrap);
    section.appendChild(addressField);

    // 이미지 코드
    const imageField = document.createElement('div');
    imageField.style.display = 'flex';
    imageField.style.flexDirection = 'column';
    imageField.style.gap = '6px';

    const imageLabel = document.createElement('span');
    imageLabel.textContent = '이미지 코드는? (대문자 3글자 또는 숫자 3글자)';
    imageLabel.style.fontWeight = '500';
    imageField.appendChild(imageLabel);

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.value = charData.imageCode;
    imageInput.maxLength = 3;
    imageInput.style.width = '120px';
    imageInput.style.padding = '10px 12px';
    imageInput.style.borderRadius = '8px';
    imageInput.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    imageInput.style.backgroundColor = '#020617';
    imageInput.style.color = '#f8fafc';
    imageInput.addEventListener('input', () => {
      imageInput.value = normalizeImageCode(imageInput.value);
      setFieldError(refs.imageError, '');
    });

    refs.imageCode = imageInput;
    imageField.appendChild(imageInput);

    const imageError = document.createElement('div');
    imageError.style.fontSize = '12px';
    imageError.style.color = '#f87171';
    refs.imageError = imageError;
    imageField.appendChild(imageError);

    section.appendChild(imageField);

    content.appendChild(section);

    state.wizardFormRefs = { character: refs };
  };

  const renderPreviewStep = () => {
    const content = state.wizardContent;
    content.innerHTML = '';
    resetWizardFormRefs();

    state.wizardPreviewText = buildWizardPrompt();

    const info = document.createElement('p');
    info.textContent = '아래 내용이 에디터에 삽입됩니다. 수정이 필요하면 [수정] 버튼으로 돌아가세요.';
    info.style.margin = '0';
    info.style.fontSize = '13px';
    info.style.color = 'rgba(226, 232, 240, 0.75)';

    const preview = document.createElement('pre');
    preview.textContent = state.wizardPreviewText;
    preview.style.backgroundColor = '#020617';
    preview.style.border = '1px solid rgba(148, 163, 184, 0.3)';
    preview.style.borderRadius = '10px';
    preview.style.padding = '16px';
    preview.style.whiteSpace = 'pre-wrap';
    preview.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    preview.style.fontSize = '13px';
    preview.style.color = '#f1f5f9';

    content.appendChild(info);
    content.appendChild(preview);
  };

  const renderCompleteStep = () => {
    const content = state.wizardContent;
    content.innerHTML = '';
    resetWizardFormRefs();

    const message = document.createElement('div');
    message.style.display = 'flex';
    message.style.flexDirection = 'column';
    message.style.gap = '12px';
    message.style.alignItems = 'flex-start';

    const heading = document.createElement('h3');
    heading.textContent = '✅ 프롬프트가 에디터에 삽입되었습니다!';
    heading.style.margin = '0';
    heading.style.fontSize = '16px';
    heading.style.color = '#f8fafc';

    const hint = document.createElement('p');
    hint.textContent = '추가 인물(NPC)을 만들고 싶다면 Genit의 "키워드북" 기능을 활용해 보세요.';
    hint.style.margin = '0';
    hint.style.fontSize = '13px';
    hint.style.color = 'rgba(226, 232, 240, 0.75)';

    message.appendChild(heading);
    message.appendChild(hint);

    content.appendChild(message);
  };

  const commitWorldForm = () => {
    const refs = state.wizardFormRefs?.world;
    if (!refs) return true;
    let valid = true;

    const worldData = state.wizardData.world;

    // Type
    const selectedType = refs.typeRadios.find((radio) => radio.checked);
    if (!selectedType) {
      setFieldError(refs.typeError, '세계관 유형을 선택해주세요.');
      valid = false;
    } else {
      worldData.typeOption = selectedType.value;
      if (selectedType.value === 'custom') {
        const customValue = refs.typeCustom?.value.trim() ?? '';
        if (!customValue) {
          setFieldError(refs.typeError, '직접 입력 값을 작성해주세요.');
          valid = false;
        } else {
          worldData.typeCustom = customValue;
        }
      }
    }

    // Special rules
    worldData.specialRules = refs.specialRules?.value ?? '';

    // Player role
    const selectedRole = refs.playerRadios.find((radio) => radio.checked);
    if (!selectedRole) {
      setFieldError(refs.playerError, '플레이어 설정을 선택해주세요.');
      valid = false;
    } else {
      worldData.playerRoleOption = selectedRole.value;
      if (selectedRole.value === 'custom') {
        const customRole = refs.playerCustom?.value.trim() ?? '';
        if (!customRole) {
          setFieldError(refs.playerError, '직접 입력 값을 작성해주세요.');
          valid = false;
        } else {
          worldData.playerRoleCustom = customRole;
        }
      }
    }

    // Locations
    const locationsValueRaw = refs.locations?.value ?? '';
    const locationsList = locationsValueRaw
      .split(',')
      .map((loc) => loc.trim())
      .filter(Boolean);

    if (!locationsList.length) {
      setFieldError(refs.locationsError, '최소 한 개 이상의 장소를 입력해주세요.');
      valid = false;
    } else {
      const normalized = locationsList.join(', ');
      worldData.locations = normalized;
      if (refs.locations) {
        refs.locations.value = normalized;
      }
    }

    return valid;
  };

  const commitCharacterForm = () => {
    const refs = state.wizardFormRefs?.character;
    if (!refs) return true;
    let valid = true;
    const charData = state.wizardData.character;

    const nameValue = refs.name?.value.trim() ?? '';
    if (!nameValue) {
      setFieldError(refs.nameError, '인물 이름을 입력해주세요.');
      valid = false;
    } else {
      charData.name = nameValue;
    }

    const selectedRole = refs.roleRadios.find((radio) => radio.checked);
    if (!selectedRole) {
      setFieldError(refs.roleError, '역할/직책을 선택해주세요.');
      valid = false;
    } else {
      charData.roleOption = selectedRole.value;
      if (selectedRole.value === 'custom') {
        const customRole = refs.roleCustom?.value.trim() ?? '';
        if (!customRole) {
          setFieldError(refs.roleError, '직접 입력 값을 작성해주세요.');
          valid = false;
        } else {
          charData.roleCustom = customRole;
        }
      }
    }

    const traitsValueRaw = refs.traits?.value ?? '';
    const traitsList = traitsValueRaw
      .split(',')
      .map((trait) => trait.trim())
      .filter(Boolean);
    if (!traitsList.length) {
      setFieldError(refs.traitsError, '최소 한 개 이상의 성격/특징을 입력해주세요.');
      valid = false;
    } else {
      const normalizedTraits = traitsList.join(', ');
      charData.traits = normalizedTraits;
      if (refs.traits) {
        refs.traits.value = normalizedTraits;
      }
    }

    const addressValue = refs.address?.value.trim() || '너';
    charData.address = addressValue;
    if (refs.address) {
      refs.address.value = addressValue;
    }

    const selectedSpeech = refs.speechRadios.find((radio) => radio.checked);
    if (selectedSpeech) {
      charData.speechLevel = selectedSpeech.value;
    }

    const imageValue = refs.imageCode?.value.trim().toUpperCase() ?? '';
    const normalizedImageValue = normalizeImageCode(imageValue);
    if (!isValidImageCode(normalizedImageValue)) {
      setFieldError(refs.imageError, '대문자 3글자 또는 숫자 3글자로 입력해주세요 (예: AAA / 123).');
      valid = false;
    } else {
      charData.imageCode = normalizedImageValue;
      if (refs.imageCode) {
        refs.imageCode.value = normalizedImageValue;
      }
    }

    return valid;
  };

  const updateWizardFooter = () => {
    if (!state.wizardFooter) return;
    const footer = state.wizardFooter;
    footer.innerHTML = '';

    const step = state.wizardStep;

    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.gap = '8px';

    const rightGroup = document.createElement('div');
    rightGroup.style.display = 'flex';
    rightGroup.style.gap = '8px';

    const makeButton = (label, variant = 'secondary') => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.style.padding = '10px 18px';
      button.style.borderRadius = '8px';
      button.style.border = 'none';
      button.style.fontSize = '14px';
      button.style.fontWeight = '600';
      button.style.cursor = 'pointer';
      button.style.transition = 'filter 180ms ease';
      if (variant === 'primary') {
        button.style.backgroundColor = '#38bdf8';
        button.style.color = '#0f172a';
      } else if (variant === 'success') {
        button.style.backgroundColor = '#10b981';
        button.style.color = '#0f172a';
      } else {
        button.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
        button.style.color = '#f8fafc';
      }
      button.addEventListener('mouseenter', () => {
        button.style.filter = 'brightness(1.1)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.filter = 'none';
      });
      return button;
    };

    if (step === 1) {
      const cancelButton = makeButton('닫기');
      cancelButton.addEventListener('click', () => closeWizard());
      leftGroup.appendChild(cancelButton);

      const nextButton = makeButton('다음 →', 'primary');
      nextButton.addEventListener('click', () => {
        if (commitWorldForm()) {
          state.wizardStep = 2;
          renderWizardStep();
        }
      });
      rightGroup.appendChild(nextButton);
    } else if (step === 2) {
      const prevButton = makeButton('← 이전');
      prevButton.addEventListener('click', () => {
        state.wizardStep = 1;
        renderWizardStep();
      });
      leftGroup.appendChild(prevButton);

      const nextButton = makeButton('미리보기 →', 'primary');
      nextButton.addEventListener('click', () => {
        if (commitCharacterForm()) {
          state.wizardStep = 3;
          renderWizardStep();
        }
      });
      rightGroup.appendChild(nextButton);
    } else if (step === 3) {
      const prevButton = makeButton('← 수정');
      prevButton.addEventListener('click', () => {
        state.wizardStep = 2;
        renderWizardStep();
      });
      leftGroup.appendChild(prevButton);

      const createButton = makeButton('생성하기', 'success');
      createButton.addEventListener('click', () => {
        applyWizardPrompt();
      });
      rightGroup.appendChild(createButton);
    } else {
      const closeButton = makeButton('완료');
      closeButton.addEventListener('click', () => {
        closeWizard();
      });
      rightGroup.appendChild(closeButton);
    }

    footer.appendChild(leftGroup);
    footer.appendChild(rightGroup);
  };

  const renderWizardStep = () => {
    ensureWizardStructure();
    if (!state.wizardOverlay) return;

    const step = state.wizardStep;
    const labelText = step === 1 ? '1 / 3 단계'
      : step === 2 ? '2 / 3 단계'
      : step === 3 ? '미리보기'
      : '완료';

    if (state.wizardStepLabel) {
      state.wizardStepLabel.textContent = labelText;
    }

    switch (step) {
      case 1:
        renderWorldStep();
        break;
      case 2:
        renderCharacterStep();
        break;
      case 3:
        renderPreviewStep();
        break;
      default:
        renderCompleteStep();
        break;
    }

    updateWizardFooter();

    window.requestAnimationFrame(() => {
      state.wizardContent?.scrollTo({ top: 0, behavior: 'auto' });
    });
  };

  const applyWizardPrompt = () => {
    const finalPrompt = buildWizardPrompt();
    if (!state.textarea) return;

    runProgrammaticChange(() => {
      setNativeValue(state.textarea, `${finalPrompt}\n`);
      const cursor = state.textarea.value.length;
      state.textarea.setSelectionRange(cursor, cursor);
      dispatchReactInputEvents(state.textarea);
    });

    scanInsertedBlocks();
    updateTextareaLayout();

    state.wizardStep = 4;
    renderWizardStep();
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
    const templateHeight = state.templateBar?.offsetHeight ?? 0;
    const chrome = headerHeight + footerHeight + templateHeight + 32;
    const available = state.editor.clientHeight - chrome;
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

    const templateBar = document.createElement('div');
    templateBar.style.display = 'flex';
    templateBar.style.flexDirection = 'column';
    templateBar.style.gap = '8px';
    templateBar.style.padding = '10px 16px';
    templateBar.style.backgroundColor = '#1e293b';
    templateBar.style.borderBottom = '1px solid rgba(148, 163, 184, 0.25)';

    const templateHeaderRow = document.createElement('div');
    templateHeaderRow.style.display = 'flex';
    templateHeaderRow.style.alignItems = 'center';
    templateHeaderRow.style.justifyContent = 'space-between';

    const templateTitle = document.createElement('div');
    templateTitle.textContent = '🧩 템플릿 블록';
    templateTitle.style.fontSize = '13px';
    templateTitle.style.fontWeight = '600';
    templateTitle.style.color = 'rgba(226, 232, 240, 0.75)';

    const wizardButton = document.createElement('button');
    wizardButton.type = 'button';
    wizardButton.textContent = '🧙 마법사로 만들기';
    wizardButton.style.border = 'none';
    wizardButton.style.borderRadius = '8px';
    wizardButton.style.padding = '8px 14px';
    wizardButton.style.fontSize = '13px';
    wizardButton.style.fontWeight = '600';
    wizardButton.style.backgroundColor = '#10b981';
    wizardButton.style.color = '#0f172a';
    wizardButton.style.cursor = 'pointer';
    wizardButton.style.transition = 'filter 180ms ease';
    wizardButton.title = '질문에 답하면 프롬프트가 자동으로 만들어집니다';
    wizardButton.addEventListener('mouseenter', () => {
      wizardButton.style.filter = 'brightness(1.1)';
    });
    wizardButton.addEventListener('mouseleave', () => {
      wizardButton.style.filter = 'none';
    });
    wizardButton.addEventListener('click', () => {
      openWizard();
    });

    templateHeaderRow.appendChild(templateTitle);
    templateHeaderRow.appendChild(wizardButton);

    const templateButtonsWrap = document.createElement('div');
    templateButtonsWrap.style.display = 'flex';
    templateButtonsWrap.style.flexWrap = 'wrap';
    templateButtonsWrap.style.gap = '8px';

    state.templateButtons = new Map();

    [...TEMPLATE_BLOCKS]
      .sort((a, b) => a.order - b.order)
      .forEach((block) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gpi-template-btn';
        button.dataset.blockId = block.id;
        button.textContent = `${block.icon} ${block.name}`;
        button.title = block.description;
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.padding = '8px 14px';
        button.style.fontSize = '13px';
        button.style.fontWeight = '600';
        button.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
        button.style.color = '#f8fafc';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 200ms ease, color 200ms ease, filter 200ms ease';
        button.setAttribute('aria-pressed', 'false');

        button.addEventListener('mouseenter', () => {
          if (!state.insertedBlocks.has(block.id)) {
            button.style.filter = 'brightness(1.15)';
          }
        });
        button.addEventListener('mouseleave', () => {
          button.style.filter = 'none';
        });

        button.addEventListener('click', () => {
          toggleBlock(block);
          window.requestAnimationFrame(() => {
            state.textarea?.focus({ preventScroll: true });
          });
        });

        state.templateButtons.set(block.id, button);
        templateButtonsWrap.appendChild(button);
      });

    templateBar.appendChild(templateHeaderRow);
    templateBar.appendChild(templateButtonsWrap);

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
    container.appendChild(templateBar);
    container.appendChild(editorBody);
    container.appendChild(footer);
    container.appendChild(resizeHandle);

    state.editor = container;
    state.textarea = textarea;
    state.header = header;
    state.footer = footer;
    state.templateBar = templateBar;

    if (!textarea.dataset.gpiTemplateBound) {
      state.inputListener = debounce(() => {
        if (!state.programmaticChange) {
          scanInsertedBlocks();
        }
      }, 400);
      textarea.addEventListener('input', state.inputListener);
      textarea.dataset.gpiTemplateBound = 'true';
    }

    ensureOverlay().appendChild(container);
    ensureEditorBounds();
    updateFullscreenButton();
    updateButtonStates();
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
    scanInsertedBlocks();
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
    if (state.wizardActive) {
      closeWizard();
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
    if (event.key === 'Escape') {
      if (state.wizardActive) {
        event.preventDefault();
        closeWizard();
        return;
      }
      if (state.isFullscreen) {
        event.preventDefault();
        exitFullscreen();
      }
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
