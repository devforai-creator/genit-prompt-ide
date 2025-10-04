# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned - Milestone 5+
- 문법 하이라이팅
- 변수 치환 시스템
- Import/Export 기능

---

## [1.0.0] - 2025-10-04

### Added - 프롬프트 마법사 (Milestone 4) 🎉 **v1.0 달성**
- 🧙 **프롬프트 마법사**: 문답 형식으로 완성도 높은 프롬프트 자동 생성
- 📋 **Phase 1 - 세계관 설정**: 4개 질문 (유형, 특별 규칙, 플레이어 설정, 주요 장소)
- 👤 **Phase 2 - 핵심 인물**: 5개 질문 (이름, 역할, 성격, 호칭/말투, 이미지 코드)
- 🔮 **템플릿 엔진**: M3 블록 자동 포함 (윤리, 시스템, 출력, 이미지 규칙)
- 👁️ **미리보기**: 생성될 프롬프트 전체 확인
- 💡 **NPC 가이드**: 완료 화면에서 Genit 키워드북 활용 안내
- 🎨 **즉시 입력**: "직접 입력" 선택 시 텍스트 필드 즉시 표시
- ✅ **인라인 validation**: 이미지 코드 실시간 형식 검증
- 🔄 **M3 동기화**: 템플릿 버튼 상태 자동 동기화
- ⌨️ **ESC 키 지원**: Wizard 닫기 (전체화면 핸들러와 충돌 방지)

### Changed
- 헤더에 "🧙 마법사로 만들기" 버튼 추가
- Wizard 모달 z-index: 2147483648 (에디터보다 위)
- 버전 0.3.0 → 1.0.0

### Technical Details
- `state.wizardActive`, `wizardStep`, `wizardData` 상태 추가
- `buildWizardPrompt()` 템플릿 엔진 함수
- `defaultWizardData()` 기본값 구조
- Phase별 폼 렌더링 (`renderPhase1Form`, `renderPhase2Form`, `renderPreview`)
- M3 헬퍼 재사용 (`scanAndUpdateButtonStates`)
- `state.programmaticChange` 플래그로 debounced scanner 중복 실행 방지

### UX Improvements
- 단계별 진행 표시 (1/2, 2/2, 미리보기)
- 라디오 버튼 + 커스텀 입력 즉시 전환
- 필수 입력 누락 시 인라인 에러 표시
- [← 이전] [다음 →] [미리보기] [생성하기] 네비게이션
- 완료 화면에 키워드북 예시 제공

---

## [0.3.0] - 2025-10-04

### Added - 원클릭 템플릿 블록 삽입 (Milestone 3) 🎯 MVP 달성
- 🧩 **5개 템플릿 블록**: 윤리 규칙, 시스템 규칙, 출력 형식, 이미지 규칙, INFO 템플릿
- 🔘 **원클릭 삽입/제거**: 버튼 클릭으로 즉시 토글
- 🏷️ **HTML 주석 마커**: `<!-- GPI:blockId:start/end -->`로 안전한 식별
- 🎨 **버튼 상태 시각화**: 삽입된 블록은 파란색 하이라이트 + `aria-pressed`
- 🔄 **자동 상태 복원**: 에디터 오픈 시 기존 블록 자동 감지
- 📍 **커서 위치 삽입**: 현재 커서 위치에 적절한 간격으로 삽입
- 🚫 **중복 방지**: 이미 삽입된 블록은 재삽입 불가
- ⚡ **실시간 동기화**: 사용자 수동 편집 감지 (디바운스 400ms)

### Changed
- 에디터 레이아웃에 템플릿 바 추가 (헤더 아래)
- `updateTextareaLayout()`에서 템플릿 바 높이 반영
- 버전 0.2.0 → 0.3.0

### Technical Details
- `TEMPLATE_BLOCKS` 배열 구조 (순서/카테고리 관리)
- `String.raw` 템플릿 리터럴로 이스케이프 문제 방지
- `programmaticChange` 플래그로 불필요한 scan 방지
- `debounce()` 유틸리티로 성능 최적화
- `normalizeBlockSpacing()` 함수로 개행 정리
- 정규식 기반 블록 제거 (마커 사이 전체 삭제)

### UX Improvements
- 템플릿 버튼에 툴팁 표시 (설명 포함)
- 버튼 hover 시 brightness 효과
- 200ms transition으로 부드러운 상태 전환
- 버튼 클릭 후 자동 포커스 복원

### Fixed
- 블록 삽입 시 적절한 간격 자동 계산
- 블록 제거 시 과도한 개행 정리

---

## [0.2.0] - 2025-10-04

### Added - 에디터 UX 대폭 개선 (Milestone 2)
- 📏 **반응형 크기**: 화면 크기에 따라 자동 조절 (85vw × 85vh, 최대 1600px × 95vh)
- 📐 **크기 조절 핸들**: 우하단 드래그로 자유롭게 크기 조절
- 💾 **크기/위치 저장**: 사용자가 조절한 크기와 위치를 자동 저장 및 복원
  - `GM_setValue`/`GM_getValue` 활용
  - 페이지 새로고침 후에도 유지
  - 화면 밖 위치 자동 보정
- ⛶ **전체화면 모드**: 원클릭으로 100vw × 100vh 전체화면 전환
  - 헤더에 전체화면 버튼 추가
  - ESC 키로 전체화면 해제
  - 전체화면 상태 시각적 표시 (버튼 하이라이트)
- 🪟 **윈도우 리사이즈 대응**: 브라우저 창 크기 변경 시 에디터 자동 조정
- ⌨️ **개선된 포커스 관리**: 크기 조절/전체화면 전환 시에도 포커스 유지
- 🔒 **최소/최대 크기 제한**: 480px × 320px ~ 1600px × 95vh

### Changed
- 메타데이터에 `@grant GM_setValue`, `@grant GM_getValue` 추가
- 기본 크기를 화면 크기의 85%로 변경 (기존: 720px 고정)
- 오버레이 클릭 시 드래그/리사이즈 중에는 닫히지 않도록 개선

### Technical Details
- 드래그 중 `user-select: none` 적용으로 텍스트 선택 방지
- `clampBounds()` 함수로 모든 크기/위치 값 검증
- `updateTextareaLayout()` 자동 호출로 내부 textarea 크기 동기화
- 전체화면 전환 시 이전 상태 저장 및 복원

### Fixed
- 작은 화면에서 에디터가 잘리는 문제 해결 (minHeight 360px)
- 에디터 위치가 화면 밖으로 나가는 문제 방지

---

## [0.1.0] - 2025-10-04

### Added
- ✨ **기본 에디터 팝업**: 프롬프트 입력 창 클릭 시 플로팅 에디터 표시
- 🎨 **다크모드 UI**: monospace 폰트, 현대적인 디자인
- 🖱️ **드래그 기능**: 타이틀바를 드래그하여 에디터 위치 이동
- 🔄 **프롬프트 자동 삽입**: "적용" 버튼으로 React 상태 업데이트 및 원본 입력창 삽입
- 🔍 **안정적인 DOM 감지**:
  - `#character_prompt` ID 기반 selector
  - 백업 selector (라벨 텍스트, placeholder 기반)
  - MutationObserver로 동적 DOM 변경 대응
- 📝 **React 이벤트 처리**: `Object.getOwnPropertyDescriptor`로 native setter 활용
- 🚪 **오버레이 닫기**: 배경 클릭 시 에디터 닫기
- 💾 **기존 값 로드**: 프롬프트 입력 창에 이미 값이 있으면 에디터에 로드

### Technical Details
- Tampermonkey userscript 기반
- Vanilla JavaScript (no dependencies)
- `@run-at document-idle` for stable DOM access
- `@match https://genit.ai/*` for site-specific targeting

### Known Issues
- 없음

---

## [0.0.0] - 2025-10-04

### Project Setup
- 🎬 프로젝트 초기 설정
- 📋 Milestone 1 계획 수립
- 🔍 Genit DOM 구조 분석 완료
- 📚 문서화:
  - `docs/genit-dom-analysis.md`
  - `reviews/roadmap/milestone1.md`
  - `reviews/roadmap/claude-initial-plan.md`
  - `reviews/roadmap/codex-roadmap.md`
  - `reviews/roadmap/gemini-plan.md`

---

[Unreleased]: https://github.com/devforai-creator/genit-prompt-ide/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v1.0.0
[0.3.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.3.0
[0.2.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.2.0
[0.1.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.1.0
[0.0.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.0.0
