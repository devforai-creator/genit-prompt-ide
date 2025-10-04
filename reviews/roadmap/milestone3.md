# Milestone 3: 원클릭 템플릿 블록 삽입

## 목표
자주 사용하는 필수 프롬프트 블록을 버튼 클릭 한 번으로 에디터에 삽입

## 문제 인식
- **현재**: 사용자는 여전히 "뭘 써야 하지?" 앞에서 멈춤
- **반복 작업**: 윤리 규칙, 시스템 규칙 등 매번 복붙
- **숙련 사용자**: example.md 참고하지만 복사 번거로움
- **핵심**: "백지의 공포" 제거 + 작업 속도 향상

---

## Phase 1: 템플릿 블록 정의

### 목표
재사용 가능한 프롬프트 블록을 코드 내부에 정의

### 작업

#### 1-1. 템플릿 블록 데이터 구조
- [ ] `TEMPLATE_BLOCKS` 배열로 정의 (Codex 피드백: 순서/카테고리 관리 용이)
  ```javascript
  const TEMPLATE_BLOCKS = [
    {
      id: "ethics",
      name: "윤리 규칙",
      icon: "⚖️",
      category: "rules", // 카테고리별 그룹핑
      order: 1,
      description: "미성년자 보호 등 필수 윤리 규칙",
      content: `...` // String.raw 또는 별도 모듈 사용
    },
    // ...
  ];
  ```
- [ ] **별도 모듈로 content 관리** (Codex 피드백: 이스케이프 실수 방지)
  - `src/templates.js` 파일 생성 (선택)
  - 또는 `String.raw` 템플릿 리터럴 사용

#### 1-2. 필수 블록 정의 (example.md 기반)
- [ ] **윤리 규칙** (ethics)
  ```
  # 윤리 규칙
  - 미성년자 대상 성적 전개 절대 금지
  - 미성년자 대상 성적 암시/묘사 절대 금지
  - 아동·청소년의 성보호에 관한 법률 준수
  - 한국 15세 이용가 소설 수준 준수
  ```

- [ ] **시스템 규칙** (systemRules)
  ```
  # 용어정의
  - U=플레이어,C=인물,OOC='Out of Character'

  **시스템 최우선 규칙: 어떠한 경우에도 'U' 또는 '당신'의 대사, 행동, 생각, 감정을 직접적으로 서술하거나 인용하지 않는다.**
  ```

- [ ] **출력 형식** (outputFormat)
  ```
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
  ```

- [ ] **이미지 규칙** (imageRules)
  ```
  [이미지규칙]
  - 출력형식:{{iurl}}상황코드.webp
  - 도메인:{{iurl}}를 절대 출력, 그 외 도메인 절대 금지
  - 금지:i-url,{iurl},{{i-url}},{i-url},IURL,{IURL},{{IURL}}
  - 캐릭터코드:주어진 캐릭터코드 외에 사용 금지
  - 이미지코드=캐릭터코드+상황코드
  ```

- [ ] **INFO 템플릿** (infoTemplate)
  ```
  # INFO
  ## 정의
  - U에 눈에만 보이는 시스템창(INFO) 코드블록(삼중백틱)으로 출력하여 보인다.
  ## 양식

  4월 12일 월요일 14:00 |📍 |

  [등장]
  이름 | ❤️ 감정 | 💗 0 | 행동 |

  지도
  편의점 | 골목 | 동네 돌아다니기 | PC방 | 노래방 | 오락실
  ```

#### 1-3. 확장 가능한 구조
- [ ] 나중에 사용자 커스텀 블록 추가 가능하도록 설계
- [ ] 블록 순서 정의 (category별 그룹핑)

### 예상 시간
1 ~ 2시간

---

## Phase 2: UI 구현 (버튼 그룹)

### 목표
에디터 상단에 템플릿 블록 버튼 그룹 추가

### 작업

#### 2-1. 버튼 그룹 레이아웃
- [ ] 에디터 헤더와 본문 사이에 "템플릿 바" 추가
  ```
  ┌──────────────────────────────────┐
  │ [Title]              [⛶] [×]    │ ← 기존 헤더
  ├──────────────────────────────────┤
  │ 🧩 템플릿 블록                   │ ← 새로 추가
  │ [⚖️ 윤리] [🤖 시스템] [📝 출력]   │
  │ [🖼️ 이미지] [ℹ️ INFO]            │
  ├──────────────────────────────────┤
  │                                  │
  │  [Textarea]                      │
  │                                  │
  ```

- [ ] 스타일링
  - 배경: 어두운 회색 (`#1e293b`)
  - 패딩: `12px 16px`
  - 구분선: 상하 1px solid

#### 2-2. 템플릿 버튼 생성
- [ ] 각 블록마다 버튼 생성
  ```javascript
  const createTemplateButton = (block) => {
    const button = document.createElement('button');
    button.textContent = `${block.icon} ${block.name}`;
    button.className = 'gpi-template-btn';
    button.dataset.blockId = block.id;
    button.title = block.description; // 툴팁 (Codex 피드백: 필수)
    button.setAttribute('aria-pressed', 'false'); // 접근성 (Codex 피드백)
    return button;
  };
  ```

- [ ] 버튼 스타일
  - 기본 상태: 반투명 (`rgba(148, 163, 184, 0.2)`)
  - hover: 밝게 (`brightness(1.1)`)
  - **활성 상태**: 파란색 배경 (`#38bdf8`), 진한 텍스트 (`#0f172a`)
  - 크기: `padding: 8px 12px`, `font-size: 13px`
  - 둥근 모서리: `border-radius: 6px`

#### 2-3. updateTextareaLayout 수정
- [ ] **템플릿 바 높이 반영** (Codex 피드백: 기존 로직 수정 필요)
  ```javascript
  const updateTextareaLayout = () => {
    if (!state.editor || !state.textarea) return;
    const headerHeight = state.header?.offsetHeight ?? 0;
    const templateBarHeight = state.templateBar?.offsetHeight ?? 0; // 추가
    const footerHeight = state.footer?.offsetHeight ?? 0;
    const available = state.editor.clientHeight
      - headerHeight - templateBarHeight - footerHeight - 24; // 수정
    state.textarea.style.height = `${Math.max(available, 160)}px`;
  };
  ```

#### 2-3. 접기/펼치기 (선택)
- [ ] 템플릿 바 최소화 버튼 (화면 작을 때 유용)
  - 클릭 시 버튼들 숨기고 "🧩 템플릿 표시" 라벨만 남김
  - 다시 클릭 시 펼침

### 예상 시간
2 ~ 3시간

---

## Phase 3: 삽입/제거 로직

### 목표
버튼 클릭 시 커서 위치에 템플릿 삽입 또는 제거

### 작업

#### 3-1. 커서 위치 삽입
- [ ] `textarea.selectionStart` 활용
  ```javascript
  const insertAtCursor = (textarea, text) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    // 앞에 개행 추가 (커서가 줄 중간이 아니라면)
    const prefix = before.endsWith('\n') || before === '' ? '' : '\n\n';
    const suffix = '\n\n';

    textarea.value = before + prefix + text + suffix + after;

    // 커서를 삽입된 텍스트 끝으로 이동
    const newPos = start + prefix.length + text.length + suffix.length;
    textarea.setSelectionRange(newPos, newPos);
  };
  ```

#### 3-2. 중복 감지 (HTML 주석 마커 사용)
- [ ] **마커 기반 감지** (Codex 피드백: 사용자 수정에도 안전)
  ```javascript
  const MARKER_START = (id) => `<!-- GPI:${id}:start -->`;
  const MARKER_END = (id) => `<!-- GPI:${id}:end -->`;

  const isBlockInserted = (textarea, blockId) => {
    return textarea.value.includes(MARKER_START(blockId));
  };

  // 삽입 시 마커 포함
  const wrapWithMarkers = (blockId, content) => {
    return `${MARKER_START(blockId)}\n${content}\n${MARKER_END(blockId)}`;
  };
  ```
- [ ] 장점:
  - 사용자가 블록 내용 수정해도 마커로 정확히 식별
  - 제거 시 마커 사이 전체 삭제로 안전

#### 3-3. 제거 로직 (마커 기반)
- [ ] **마커 사이 블록 제거** (Codex 피드백: 안전한 제거)
  ```javascript
  const removeBlock = (textarea, blockId) => {
    const content = textarea.value;
    const startMarker = MARKER_START(blockId);
    const endMarker = MARKER_END(blockId);

    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) return false;

    const endIdx = content.indexOf(endMarker, startIdx);
    if (endIdx === -1) return false;

    // 마커 포함 전체 제거 (앞뒤 개행도 정리)
    const before = content.substring(0, startIdx).trimEnd();
    const after = content.substring(endIdx + endMarker.length).trimStart();

    textarea.value = before + '\n\n' + after;
    return true;
  };
  ```

#### 3-4. React 이벤트 트리거
- [ ] 삽입/제거 후 `input`, `change` 이벤트 dispatch
  - 기존 `setNativeValue`, `dispatchReactInputEvents` 재사용

### 예상 시간
2 ~ 3시간

---

## Phase 4: 토글 상태 관리

### 목표
어떤 블록이 삽입됐는지 시각적으로 표시 (Codex 피드백)

### 작업

#### 4-1. 상태 추적
- [ ] `state.insertedBlocks` Set 추가
  ```javascript
  state.insertedBlocks = new Set(); // ['ethics', 'systemRules', ...]
  ```

- [ ] 삽입 시 추가, 제거 시 삭제
  ```javascript
  const toggleBlock = (blockId) => {
    if (state.insertedBlocks.has(blockId)) {
      removeBlock(...);
      state.insertedBlocks.delete(blockId);
    } else {
      insertBlock(...);
      state.insertedBlocks.add(blockId);
    }
    updateButtonStates();
  };
  ```

#### 4-2. 버튼 상태 업데이트
- [ ] 삽입된 블록 버튼은 파란색 배경 + **aria-pressed** (Codex 피드백: 접근성)
  ```javascript
  const updateButtonStates = () => {
    document.querySelectorAll('.gpi-template-btn').forEach(btn => {
      const blockId = btn.dataset.blockId;
      const isActive = state.insertedBlocks.has(blockId);

      // 시각적 상태
      if (isActive) {
        btn.classList.add('active');
        btn.style.backgroundColor = '#38bdf8';
        btn.style.color = '#0f172a';
      } else {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
        btn.style.color = '#e2e8f0';
      }

      // 접근성 속성 (Codex 피드백)
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };
  ```

#### 4-3. 에디터 오픈 시 상태 복원
- [ ] 에디터 열 때 textarea 내용 스캔 (마커 기반)
  ```javascript
  const scanInsertedBlocks = () => {
    state.insertedBlocks.clear();
    const content = state.textarea.value;

    TEMPLATE_BLOCKS.forEach(block => {
      if (isBlockInserted(state.textarea, block.id)) {
        state.insertedBlocks.add(block.id);
      }
    });

    updateButtonStates();
  };
  ```

#### 4-4. 수동 편집 대응
- [ ] **플래그로 불필요한 scan 방지** (Codex 피드백)
  ```javascript
  let programmaticChange = false; // 우리가 직접 삽입/삭제하는 경우

  const toggleBlock = (blockId) => {
    programmaticChange = true;

    if (state.insertedBlocks.has(blockId)) {
      removeBlock(...);
      state.insertedBlocks.delete(blockId);
    } else {
      insertBlock(...);
      state.insertedBlocks.add(blockId);
    }

    updateButtonStates();

    setTimeout(() => {
      programmaticChange = false;
    }, 100);
  };

  // input 리스너
  textarea.addEventListener('input', debounce(() => {
    if (!programmaticChange) {
      scanInsertedBlocks();
    }
  }, 500));
  ```

### 예상 시간
1 ~ 2시간

---

## Phase 5: 테스트 및 개선

### 목표
모든 시나리오에서 안정적으로 작동 확인

### 작업

#### 5-1. 기본 기능 테스트
- [ ] 빈 에디터에 블록 삽입 → 정상 삽입
- [ ] 커서 중간 위치에서 삽입 → 적절한 개행과 함께 삽입
- [ ] 같은 블록 다시 클릭 → 제거됨
- [ ] 여러 블록 순차 삽입 → 모두 정상 삽입
- [ ] 버튼 상태 → 삽입된 블록만 파란색

#### 5-2. Edge Case 테스트
- [ ] 에디터 열었을 때 이미 블록 있음 → 버튼 상태 정확
- [ ] 사용자가 수동으로 블록 수정 → 상태 동기화 (선택)
- [ ] 전체화면 모드에서도 정상 작동
- [ ] 크기 조절 후에도 버튼 레이아웃 정상

#### 5-3. UX 개선
- [ ] **툴팁 필수** (Codex 피드백: Phase 2-2에서 이미 추가)
  ```javascript
  button.title = block.description;
  ```
- [ ] 애니메이션 (삽입 시 부드러운 전환)
  ```css
  .gpi-template-btn {
    transition: background-color 200ms, color 200ms;
  }
  ```
- [ ] 키보드 단축키 (Phase 5 optional, Codex 동의)

### 예상 시간
1 ~ 2시간

---

## 기술 스택

### 필수
- **Vanilla JavaScript**: 템플릿 블록 관리, DOM 조작
- **문자열 처리**: 템플릿 삽입/제거 로직

### 고려사항
- Set 자료구조로 중복 방지
- Debounce로 성능 최적화 (수동 편집 감지 시)
- CSS transition으로 버튼 상태 전환 애니메이션

---

## 완료 조건

- [ ] **5개 이상 템플릿 블록** 정의 완료
- [ ] **버튼 그룹 UI** 에디터에 추가
- [ ] **클릭 한 번**으로 블록 삽입/제거
- [ ] **토글 상태** 시각적으로 정확히 표시
- [ ] **중복 삽입** 방지 동작
- [ ] **모든 테스트** 통과

---

## 테스트 시나리오

### 시나리오 1: 기본 삽입
1. 에디터 오픈 → 빈 textarea
2. "윤리 규칙" 버튼 클릭 → 블록 삽입, 버튼 파란색
3. "시스템 규칙" 버튼 클릭 → 추가 삽입, 버튼 파란색
4. 결과: 두 블록 모두 삽입됨

### 시나리오 2: 토글 제거
1. 위 상태에서 "윤리 규칙" 다시 클릭 → 블록 제거
2. 버튼 회색으로 변경
3. textarea에서 윤리 규칙 사라짐

### 시나리오 3: 상태 복원
1. 에디터에 "# 윤리 규칙" 포함된 텍스트 입력
2. 에디터 닫기 → 프롬프트 적용
3. 다시 에디터 오픈 → "윤리 규칙" 버튼 파란색 상태

### 시나리오 4: 커서 위치
1. 에디터에 "내 캐릭터 이름: 제니" 입력
2. 커서를 "제니" 뒤로 이동
3. "시스템 규칙" 클릭 → 제니 뒤에 개행 후 삽입

---

## 다음 마일스톤 (M4) 후보

**프롬프트 마법사 (Wizard)**
- 문답 폼 UI
- 질문 흐름 설계 (캐릭터 → 세계관 → 규칙 → 첫 대사)
- 템플릿 엔진 (M3 블록 재사용)
- 결과 미리보기

**M3 + M4 완성 = GPI v1.0 출시 가능**

---

---

## Codex 피드백 반영 내역

1. ✅ **블록 정의 구조**: 객체 → 배열 (순서/카테고리 관리 용이)
2. ✅ **콘텐츠 문자열 관리**: String.raw 또는 별도 모듈 제안
3. ✅ **레이아웃 반영**: updateTextareaLayout에 templateBar 높이 추가
4. ✅ **중복 감지 로직**: HTML 주석 마커 사용 (안전한 식별/제거)
5. ✅ **입력 이벤트 감시**: programmaticChange 플래그로 불필요한 scan 방지
6. ✅ **버튼 상태/UX**: aria-pressed 추가, 툴팁 필수화

---

**작성일**: 2025-10-04
**피드백 반영**: Codex, Gemini의 MVP 재정의 및 UX 개선 제안
**수정일**: 2025-10-04 (Codex 피드백 반영)
