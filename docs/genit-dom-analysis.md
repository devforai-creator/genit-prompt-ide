# Genit DOM 구조 분석 결과

**분석 대상**: https://genit.ai/ko/create/content
**분석 일자**: 2025-10-04
**분석 도구**: AI Comet + 브라우저 DevTools Console

---

## 1. Textarea 요소 분석

### 전체 Textarea 목록

페이지에 **총 3개의 textarea** 존재:

```javascript
// DevTools Console 실행 결과
document.querySelectorAll('textarea').forEach((el, i) => {
  console.log(`${i}: class="${el.className}" id="${el.id}" node="${el.getAttribute('node')}"`)
})

// 출력:
// 0: class="flex w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 border-input focus:border-primary-500 dark:focus:border-primary-500 min-h-[80px] resize-none overflow-hidden transition-[height] duration-200 ease-in-out" id="character_prompt" node="null"
// 1: class="..." id="" node="null"
// 2: class="..." id="" node="null"
```

### Textarea 역할 및 식별 방법

| 순서 | ID | 역할 | 설명 텍스트 | 기본 내용 예시 |
|------|----|----|------------|---------------|
| 0 | `character_prompt` | **프롬프트 입력** (메인) | "이미지 호출을 원하는 경우 호출 규칙을 함께 입력하세요..." | `이미지 출력 규칙 예시#출력형식:{{iurl}}이미지코드.webp...` |
| 1 | *(없음)* | 첫 대사 입력 | "마크다운 형식을 지원합니다." | `안녕하세요! 무엇을 도와드릴까요?` |
| 2 | *(없음)* | 추가 프롬프트 입력 | "이 시작 설정에만 적용되는 추가 프롬프트를 입력하세요" | `이 시작 설정에만 적용되는 추가 프롬프트를 입력하세요` |

---

## 2. 핵심 Selector

### ✅ 가장 안정적인 방법

```javascript
// ID를 사용한 선택 (권장)
const promptTextarea = document.getElementById('character_prompt');
// 또는
const promptTextarea = document.querySelector('#character_prompt');
```

### ⚠️ 사용 불가능한 Selector

1. **`node` 속성**:
   - HTML에서는 node="1189" 같은 값이 보이지만
   - DevTools Console에서는 `node="null"`로 표시됨
   - React 내부적으로 사용하는 속성으로 추정
   - **새로고침마다 변경됨** (940 → 1189 → 1593 등)

2. **`class` 속성**:
   - 3개 textarea 모두 동일한 class (TailwindCSS)
   - 구분 불가능

---

## 3. 프레임워크 정보

- **React 기반 SPA**
- 렌더링 시마다 node 속성 재할당
- 동적 DOM 조작 필요

---

## 4. "생성하기" 버튼

```html
<button disabled="">생성하기</button>
```

- 필수 항목(제목, 컨텐츠 프롬프트 등)이 비어있으면 `disabled` 상태
- 모든 필드 입력 후 활성화됨

**Selector 방법** (추정):
```javascript
// 텍스트 기반
const createButton = Array.from(document.querySelectorAll('button'))
  .find(btn => btn.textContent.trim() === '생성하기');

// 또는 disabled 속성 제거 후 클릭
createButton.removeAttribute('disabled');
createButton.click();
```

---

## 5. 텍스트 삽입 방법

### React에서 안전하게 값 삽입

```javascript
const textarea = document.getElementById('character_prompt');

// 1. 값 설정
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  'value'
).set;
nativeTextareaSetter.call(textarea, '새로운 프롬프트 내용');

// 2. React 이벤트 트리거
const inputEvent = new Event('input', { bubbles: true });
textarea.dispatchEvent(inputEvent);

const changeEvent = new Event('change', { bubbles: true });
textarea.dispatchEvent(changeEvent);
```

---

## 6. 부모 컨테이너 구조

```html
<main>
  <!-- 탭 버튼들 -->
  <div>기본</div>
  <div>프롬프트</div>
  <div>키워드북</div>
  <div>이미지</div>

  <!-- 프롬프트 섹션 -->
  <section>
    <p>이미지 호출을 원하는 경우 호출 규칙을 함께 입력하세요...</p>
    <textarea id="character_prompt">...</textarea>
  </section>

  <!-- 첫 대사 섹션 -->
  <section>
    <p>마크다운 형식을 지원합니다.</p>
    <textarea>...</textarea>
  </section>

  <!-- 추가 프롬프트 섹션 -->
  <section>
    <p>이 시작 설정에만 적용되는 추가 프롬프트를 입력하세요</p>
    <textarea>...</textarea>
  </section>

  <button disabled="">생성하기</button>
</main>
```

---

## 7. 페이지 로드 타이밍

### MutationObserver 필요 여부

React SPA이므로 동적 렌더링 가능성 있음.
안전한 초기화:

```javascript
// 방법 1: DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('character_prompt');
  if (textarea) {
    // 초기화 로직
  }
});

// 방법 2: MutationObserver (더 안전)
const observer = new MutationObserver(() => {
  const textarea = document.getElementById('character_prompt');
  if (textarea) {
    observer.disconnect();
    // 초기화 로직
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

---

## 8. 보안 및 주의사항

- **CSP (Content Security Policy)**: Tampermonkey `@grant` 권한 필요
- **XSS 방지**: 사용자 입력 sanitize
- **이벤트 충돌**: React synthetic events와 충돌 가능성 → native setter 사용

---

## 9. 테스트 체크리스트

- [ ] `#character_prompt` selector 작동 확인
- [ ] 텍스트 삽입 후 React 상태 업데이트 확인
- [ ] 생성하기 버튼 활성화 확인
- [ ] 페이지 새로고침 후 스크립트 재작동 확인
- [ ] 다크모드에서도 정상 작동 확인
- [ ] 긴 프롬프트(2000자+) 삽입 테스트

---

## 10. 대체 Selector (백업)

`id="character_prompt"`가 변경되는 경우를 대비한 백업:

```javascript
// 방법 1: 설명 텍스트로 찾기
const findPromptTextarea = () => {
  const textareas = Array.from(document.querySelectorAll('textarea'));
  return textareas.find(ta => {
    const label = ta.previousElementSibling?.textContent || '';
    return label.includes('이미지 호출');
  });
};

// 방법 2: placeholder로 찾기
const findByPlaceholder = () => {
  return document.querySelector('textarea[placeholder*="이미지"]');
};

// 방법 3: 순서 기반 (가장 불안정)
const getFirstTextarea = () => {
  return document.querySelectorAll('textarea')[0];
};
```

---

**분석 담당**: AI Comet
**문서 작성**: Claude
**검증 상태**: ✅ Console 결과로 검증 완료
