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

[Unreleased]: https://github.com/yourusername/genit-prompt-ide/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/genit-prompt-ide/releases/tag/v0.1.0
[0.0.0]: https://github.com/yourusername/genit-prompt-ide/releases/tag/v0.0.0
