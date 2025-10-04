# GPI (Genit Prompt IDE)

**Genit 캐릭터 채팅 플랫폼을 위한 프롬프트 편집기**

Genit에서 복잡하고 긴 시스템 프롬프트를 효율적으로 작성하고 관리할 수 있는 Tampermonkey 스크립트입니다.

---

## 🎯 주요 기능

### Milestone 1 (v0.1.0) ✅
- ✨ **드래그 가능한 플로팅 에디터**: 프롬프트 입력 창 클릭 시 팝업
- 📝 **편안한 편집 환경**: monospace 폰트, 다크모드 UI
- 🔄 **원클릭 적용**: 편집 완료 후 버튼 하나로 원본 입력창에 자동 삽입
- 🎨 **깔끔한 UI**: 반투명 오버레이, 현대적인 디자인
- 🔍 **안정적인 DOM 감지**: React SPA 대응, MutationObserver 활용

### Milestone 2 (v0.2.0) ✅
- 📏 **반응형 크기**: 화면 크기에 따라 자동 조절 (85vw × 85vh)
- 📐 **크기 조절**: 우하단 핸들 드래그로 자유롭게 크기 조절
- 💾 **크기/위치 저장**: 조절한 크기와 위치 자동 저장 및 복원
- ⛶ **전체화면 모드**: 원클릭으로 몰입 환경 전환
- 🪟 **윈도우 리사이즈 대응**: 브라우저 창 크기 변경 시 자동 조정
- ⌨️ **개선된 포커스**: 크기 조절/전체화면 전환 시에도 포커스 유지

### Milestone 3 (v0.3.0) ✅ 🎯 **MVP 달성**
- 🧩 **5개 템플릿 블록**: 윤리 규칙, 시스템 규칙, 출력 형식, 이미지 규칙, INFO 템플릿
- 🔘 **원클릭 삽입/제거**: 버튼 한 번으로 프롬프트 블록 토글
- 🏷️ **안전한 관리**: HTML 주석 마커로 블록 식별
- 🎨 **시각적 피드백**: 삽입된 블록은 파란색 하이라이트
- 🔄 **자동 상태 복원**: 에디터 오픈 시 기존 블록 자동 감지
- 📍 **스마트 삽입**: 커서 위치에 적절한 간격으로 삽입

---

## 📦 설치 방법

### 1. Tampermonkey 설치
브라우저에 Tampermonkey 확장 프로그램을 설치하세요:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. 스크립트 설치
1. [`src/gpi.user.js`](./src/gpi.user.js) 파일의 내용을 복사
2. Tampermonkey 대시보드 열기
3. "새 스크립트 만들기" 클릭
4. 복사한 내용 붙여넣기
5. 저장 (Ctrl+S)

### 3. 사용 시작
https://genit.ai 페이지로 이동하면 자동으로 활성화됩니다.

---

## 🚀 사용 방법

### 기본 워크플로우
1. **Genit 캐릭터 생성 페이지** (https://genit.ai/ko/create/content) 접속
2. **"프롬프트" 탭** 클릭
3. **프롬프트 입력 창 클릭** → 에디터 팝업 자동 표시
4. **템플릿 블록 버튼 클릭** → 필수 규칙들 자동 삽입 (윤리, 시스템, 출력 등)
5. 에디터에서 **캐릭터 설정 추가 작성**
6. **"적용" 버튼** 클릭 → 원본 입력창에 자동 삽입

### 템플릿 블록 사용
- **🧩 템플릿 블록**: 에디터 상단에 5개 버튼 표시
  - ⚖️ 윤리 규칙: 미성년자 보호 등 필수 윤리 규칙
  - 🤖 시스템 규칙: 용어 정의 및 최우선 규칙
  - 📝 출력 형식: 대사 형식, 분량 가이드
  - 🖼️ 이미지 규칙: 이미지 코드 규칙
  - ℹ️ INFO 템플릿: INFO 코드블록 양식
- **클릭 한 번**: 삽입 (파란색으로 변경)
- **다시 클릭**: 제거 (회색으로 복원)
- **자동 감지**: 에디터 열 때 기존 블록 자동 인식

### 단축키 및 제스처
- **타이틀바 드래그**: 에디터 위치 이동
- **우하단 핸들 드래그**: 에디터 크기 조절
- **⛶ 버튼 클릭**: 전체화면 모드 전환
- **ESC**: 전체화면 모드 해제 (전체화면 시)
- **오버레이 클릭**: 에디터 닫기 (취소)

---

## 🗂️ 프로젝트 구조

```
genit-prompt-ide/
├── src/
│   └── gpi.user.js          # Tampermonkey 스크립트
├── docs/
│   └── genit-dom-analysis.md # Genit DOM 구조 분석
├── reviews/
│   └── roadmap/
│       ├── milestone1.md     # M1 작업 계획
│       ├── claude-initial-plan.md
│       ├── codex-roadmap.md
│       └── gemini-plan.md
├── example.md                # 프롬프트 예시
├── README.md                 # 이 파일
└── CHANGELOG.md              # 변경 이력
```

---

## 🛠️ 기술 스택

- **Tampermonkey**: Userscript 실행 환경
- **Vanilla JavaScript**: DOM 조작, 이벤트 처리
- **React 이벤트 처리**: `Object.getOwnPropertyDescriptor` 활용
- **MutationObserver**: 동적 DOM 변경 감지

---

## 🗺️ 로드맵

### Milestone 1 (완료) ✅
- [x] 기본 에디터 팝업
- [x] 드래그 기능
- [x] 프롬프트 자동 삽입

### Milestone 2 (완료) ✅
- [x] 반응형 크기
- [x] 크기 조절 핸들
- [x] 크기/위치 저장 및 복원
- [x] 전체화면 모드
- [x] 포커스 흐름 개선

### Milestone 3 (완료) ✅ 🎯 **MVP 달성**
- [x] 원클릭 템플릿 블록 삽입
- [x] 5개 핵심 블록 정의
- [x] 토글 상태 관리 및 시각화
- [x] HTML 주석 마커 기반 안전한 식별

### Milestone 4 (계획 중) - **v1.0 목표**
- [ ] 프롬프트 마법사 (Wizard)
  - Phase 1: 세계관 설정 (4개 질문)
  - Phase 2: 핵심 인물 (5개 질문, 메인 캐릭터 1명)
  - 템플릿 엔진 (M3 블록 자동 포함)
  - 미리보기 및 생성
  - NPC 가이드 (Genit 키워드북 활용 안내)

### Milestone 5 (계획 중)
- [ ] 문법 하이라이팅
- [ ] 변수 치환 시스템 (`{{변수명}}`)
- [ ] 글자 수 카운터
- [ ] Import/Export (JSON, MD)

자세한 로드맵은 [`reviews/roadmap/`](./reviews/roadmap/) 참고

---

## 📄 라이선스

GNU General Public License v3.0 (GPL-3.0)

이 프로젝트는 GPL-3.0 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

---

## 🤝 기여

이슈 및 PR 환영합니다!

### 개발 참여자
- **분석**: AI Comet
- **문서화**: Claude
- **개발**: Codex
- **기획**: 소중한코알라5299

---

## 📞 문의

프로젝트 관련 문의는 Issues를 이용해주세요.

---

**Made with ❤️ for Genit users**
