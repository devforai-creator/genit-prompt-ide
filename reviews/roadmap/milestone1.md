# Milestone 1: 기본 에디터 팝업

## 목표
Genit 프롬프트 입력 창 클릭 → 에디터 팝업 → 텍스트 작성 → 승인 → 자동 삽입

## 작업 목록

### 1. Genit DOM 구조 분석
**담당**: AI Comet (외부 분석)
- [ ] 프롬프트 입력 필드 selector 찾기
- [ ] 입력 필드 타입 확인 (textarea, contenteditable, input 등)
- [ ] 클릭 이벤트를 감지할 요소 식별
- [ ] 텍스트 삽입 시 트리거해야 할 이벤트 확인 (input, change 등)

**산출물**: `docs/genit-dom-analysis.md`

---

### 2. Tampermonkey 스크립트 기본 구조
- [ ] `src/gpi.user.js` 파일 생성
- [ ] 메타데이터 블록 작성
  - `@name`, `@version`, `@description`
  - `@match` (Genit URL 패턴)
  - `@grant` (필요한 권한)
- [ ] 스크립트 로드 확인 (console.log)

**파일**: `src/gpi.user.js`

---

### 3. 팝업 에디터 UI 구현
- [ ] 플로팅 윈도우 HTML/CSS
  - 드래그 가능
  - 크기 조절 가능 (선택)
  - 반투명 배경 오버레이
- [ ] 에디터 영역 (textarea)
  - 기본 스타일링
  - monospace 폰트
  - 라인 번호 (선택)
- [ ] 버튼 그룹
  - "적용" 버튼
  - "취소" 버튼
  - "불러오기" 버튼 (선택)

**스타일**: Inline CSS 또는 `GM_addStyle`

---

### 4. 이벤트 바인딩
- [ ] 프롬프트 입력 필드 클릭 감지
  - 클릭 시 에디터 팝업 표시
  - 기존 내용이 있으면 에디터에 로드
- [ ] "적용" 버튼 클릭
  - 에디터 내용을 원본 입력 필드에 삽입
  - 필요한 이벤트 트리거 (input, change)
  - 팝업 닫기
- [ ] "취소" 버튼 클릭
  - 팝업 닫기 (변경사항 버림)
- [ ] 드래그 기능 구현
  - 타이틀바 드래그로 이동

---

### 5. 프롬프트 삽입 로직
- [ ] DOM에 텍스트 삽입 함수 작성
- [ ] React/Vue 등 프레임워크 감지 및 처리
  - `Object.getOwnPropertyDescriptor` 활용
  - `setter` 직접 호출
- [ ] 삽입 후 검증
  - 실제로 값이 들어갔는지 확인

---

### 6. 테스트
- [ ] Genit 페이지에서 스크립트 로드 확인
- [ ] 팝업 표시/숨김 동작
- [ ] 텍스트 삽입 정상 작동
- [ ] 브라우저 호환성 (Chrome, Firefox)
- [ ] edge case 처리
  - 입력 필드가 없을 때
  - 페이지 로드 타이밍 문제

---

## 기술 스택

### 필수
- **Tampermonkey**: userscript 실행
- **Vanilla JavaScript**: DOM 조작, 이벤트 처리
- **CSS**: 팝업 스타일링

### 고려사항
- `MutationObserver`: DOM 변경 감지 (필요 시)
- `GM_addStyle`: CSS 삽입
- `GM_getValue/GM_setValue`: 로컬 저장 (추후 사용)

---

## 파일 구조

```
genit-prompt-ide/
├── src/
│   └── gpi.user.js          # 메인 스크립트
├── docs/
│   └── genit-dom-analysis.md # DOM 분석 결과 (외부 제공)
├── reviews/
│   └── roadmap/
│       ├── milestone1.md     # 이 파일
│       ├── claude-initial-plan.md
│       ├── codex-roadmap.md
│       └── gemini-plan.md
└── example.md                # 프롬프트 예시
```

---

## 완료 조건

- [ ] Genit 페이지에서 프롬프트 입력 창 클릭 시 에디터 팝업
- [ ] 에디터에서 텍스트 작성 가능
- [ ] "적용" 버튼으로 원본 입력 필드에 자동 삽입
- [ ] "취소" 버튼으로 팝업 닫기
- [ ] 기본적인 드래그 기능 동작

---

## 다음 마일스톤 (M2) 후보

- 여러 프롬프트 프리셋 저장/관리
- 문법 하이라이팅
- 변수 치환 시스템 (`{{변수명}}`)
- Import/Export 기능

---

**작성일**: 2025-10-04
