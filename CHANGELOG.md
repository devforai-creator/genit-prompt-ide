# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- 여러 프롬프트 프리셋 저장/관리
- 프리셋 목록 UI
- 문법 하이라이팅
- 변수 치환 시스템
- Import/Export 기능

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

[Unreleased]: https://github.com/devforai-creator/genit-prompt-ide/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.2.0
[0.1.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.1.0
[0.0.0]: https://github.com/devforai-creator/genit-prompt-ide/releases/tag/v0.0.0
