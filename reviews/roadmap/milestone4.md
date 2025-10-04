# Milestone 4: 프롬프트 마법사 (Wizard)

## 목표
문답 형식으로 사용자를 안내하여 완성도 높은 프롬프트 자동 생성

## 문제 인식
- **M3 완료 후 남은 과제**: 템플릿 블록만으로는 "뭘 써야 하지?" 해결 안 됨
- **백지의 공포**: 캐릭터 아이디어는 있지만 프롬프트 구조 몰라서 막힘
- **신규 사용자 진입 장벽**: example.md 같은 복잡한 프롬프트 작성법 학습 필요
- **핵심**: 질문에 답만 하면 → 완성된 프롬프트 생성

---

## 전체 흐름 (UX)

```
에디터 열기
   ↓
[🧙 마법사로 만들기] 버튼 클릭
   ↓
━━━━━━━━━━━━━━━━━━━
Phase 1: 세계관 설정
━━━━━━━━━━━━━━━━━━━
Q1. 세계관 유형은?
  [ ] 학교/일상  [ ] 판타지  [ ] 현대 도시  [ ] 직접 입력
Q2. 특별한 규칙이 있나요? (선택)
  [textarea]
Q3. 플레이어는 어떤 존재인가요?
  [ ] 평범한 학생  [ ] 기억 상실  [ ] 특별한 능력 숨김  [ ] 직접 입력
Q4. 주요 장소는? (쉼표로 구분, INFO 지도에 표시됩니다)
  [input]
   ↓
[다음 →]
━━━━━━━━━━━━━━━━━━━
Phase 2: 핵심 인물
━━━━━━━━━━━━━━━━━━━
Q1. 이름은?
  [input]
Q2. 역할/직책은?
  [ ] 여사친/남사친  [ ] 라이벌  [ ] 스승  [ ] 직접 입력
Q3. 성격/특징은? (3-4가지, 쉼표로 구분)
  [input]
Q4. 플레이어를 어떻게 부르나요? 말투는?
  [input 호칭] [ ] 존댓말  [ ] 반말
Q5. 이미지 코드는? (알파벳 대문자 3글자, 예: AAA)
  [input maxlength=3]
   ↓
[← 이전] [미리보기 →]
━━━━━━━━━━━━━━━━━━━
미리보기
━━━━━━━━━━━━━━━━━━━
생성될 프롬프트 전체 표시
(스크롤 가능)
   ↓
[← 수정] [생성하기]
━━━━━━━━━━━━━━━━━━━
완료 화면
━━━━━━━━━━━━━━━━━━━
✅ 프롬프트가 에디터에 삽입되었습니다!

💡 추가 인물(NPC)을 만들고 싶으신가요?
Genit의 "키워드북" 기능을 활용하세요.

[키워드북 예시 보기] [닫기]
```

---

## Phase 1: UI 구현

### 목표
마법사 모달 UI 및 단계별 네비게이션

### 작업

#### 1-1. 마법사 진입점
- [ ] 에디터 상단에 **"🧙 마법사로 만들기"** 버튼 추가
  - 위치: 템플릿 바 옆 또는 푸터
  - 스타일: 강조색 (`#10b981` 녹색 계열)
  - 툴팁: "질문에 답하면 프롬프트가 자동으로 만들어집니다"

#### 1-2. 마법사 모달 생성
- [ ] 전체 화면 모달 (오버레이 + 중앙 패널)
  ```javascript
  const wizardModal = document.createElement('div');
  wizardModal.style.position = 'fixed';
  wizardModal.style.top = '50%';
  wizardModal.style.left = '50%';
  wizardModal.style.transform = 'translate(-50%, -50%)';
  wizardModal.style.width = 'min(800px, 90vw)';
  wizardModal.style.maxHeight = '80vh';
  wizardModal.style.backgroundColor = '#0f172a';
  wizardModal.style.borderRadius = '12px';
  wizardModal.style.zIndex = '2147483648'; // 에디터보다 위
  ```

- [ ] 헤더
  - 타이틀: "🧙 프롬프트 마법사"
  - 진행 표시: "1/2 단계" or 프로그레스 바
  - 닫기 버튼 (×)

- [ ] 본문 (스크롤 가능)
  - Phase별 질문 폼
  - 각 질문: 라벨 + 입력 요소 + 설명

- [ ] 푸터
  - [← 이전] [다음 →] 또는 [미리보기] [생성하기] 버튼
  - 버튼 상태: 이전 단계 없으면 [이전] 비활성화

#### 1-3. 단계별 네비게이션
- [ ] `state.wizardStep` = 1 (Phase 1) or 2 (Phase 2) or 3 (미리보기)
- [ ] [다음] 클릭 → validation 후 step++
- [ ] [이전] 클릭 → step--
- [ ] 각 step별로 다른 폼 렌더링

### 예상 시간
3 ~ 4시간

---

## Phase 2: Phase 1 폼 구현 (세계관)

### 목표
4개 질문 입력 폼 + validation

### 작업

#### 2-1. Q1: 세계관 유형 (라디오 버튼 + 텍스트)
- [ ] 라디오 버튼 그룹
  ```html
  <label>
    <input type="radio" name="worldType" value="school">
    학교/일상 (친구, 선후배)
  </label>
  <label>
    <input type="radio" name="worldType" value="fantasy">
    판타지 (마법, 기사, 왕국)
  </label>
  <label>
    <input type="radio" name="worldType" value="modern">
    현대 도시 (직장, 카페, 일상)
  </label>
  <label>
    <input type="radio" name="worldType" value="custom">
    직접 입력
  </label>
  ```
- [ ] "직접 입력" 선택 시 textarea 표시
  - placeholder: "예: 사이버펑크 미래의 뒷골목"

#### 2-2. Q2: 특별한 규칙 (textarea, 선택)
- [ ] textarea (선택사항)
  - placeholder: "예: 마나는 재능의 척도이며, 1은 최하급으로 취급받는다."
  - 라벨: "이 세계에만 존재하는 특별한 규칙이나 개념이 있나요? (선택사항)"

#### 2-3. Q3: 플레이어 설정 (라디오 + 텍스트)
- [ ] 라디오 버튼 그룹
  ```
  [ ] 평범한 학생
  [ ] 기억을 잃은 채 깨어남
  [ ] 특별한 능력을 숨기고 있음
  [ ] 직접 입력
  ```
- [ ] "직접 입력" 선택 시 input 표시

#### 2-4. Q4: 주요 장소 (input)
- [ ] 텍스트 입력
  - placeholder: "편의점, 골목, PC방, 노래방"
  - 설명: "쉼표로 구분하세요. 이곳은 INFO 지도에 표시됩니다." (Codex 피드백)

#### 2-5. Validation
- [ ] Q1 필수: 세계관 유형 선택
- [ ] Q4 필수: 최소 1개 장소
- [ ] "직접 입력" 선택 시 텍스트 필수

### 예상 시간
2 ~ 3시간

---

## Phase 3: Phase 2 폼 구현 (핵심 인물)

### 목표
메인 캐릭터 1명 정보 입력

### 작업

#### 3-1. Q1: 이름 (input, 필수)
- [ ] 텍스트 입력
  - placeholder: "예: 제니"
  - maxlength: 20

#### 3-2. Q2: 역할/직책 (라디오 + 텍스트)
- [ ] 라디오 버튼 그룹
  ```
  [ ] 여사친/남사친
  [ ] 라이벌
  [ ] 스승/멘토
  [ ] 동료
  [ ] 직접 입력
  ```
- [ ] "직접 입력" 선택 시 input 표시

#### 3-3. Q3: 성격/특징 (input, 필수)
- [ ] 텍스트 입력 (쉼표 구분)
  - placeholder: "차분함, 친절함, 관찰력 좋음, 사진에 진심"
  - 설명: "3-4가지를 쉼표로 구분하세요"

#### 3-4. Q4: 호칭/말투 (input + 라디오, 필수)
- [ ] 호칭 입력
  - placeholder: "예: 너, 이름, 별명"
  - 라벨: "플레이어를 어떻게 부르나요?"
- [ ] 말투 선택
  ```
  [ ] 존댓말  [ ] 반말
  ```

#### 3-5. Q5: 이미지 코드 (input, 필수)
- [ ] 텍스트 입력
  - maxlength: 3
  - pattern: `[A-Z]{3}`
  - placeholder: "AAA"
  - 설명: "알파벳 대문자 3글자 (예: AAA, LYS)" (Codex 피드백)

#### 3-6. Validation
- [ ] 모든 필드 필수
- [ ] 이미지 코드 형식 검증 (대문자 3글자)
- [ ] 성격/특징 최소 1개 이상

### 예상 시간
2 ~ 3시간

---

## Phase 4: 템플릿 엔진

### 목표
사용자 입력 → 프롬프트 문자열 생성

### 작업

#### 4-1. 데이터 수집
- [ ] Phase 1, 2 입력값을 객체로 수집
  ```javascript
  const wizardData = {
    world: {
      type: 'school', // or custom text
      specialRules: '...',
      playerRole: '평범한 학생',
      locations: ['편의점', '골목', 'PC방']
    },
    character: {
      name: '제니',
      role: '여사친',
      traits: ['차분함', '친절함', '관찰력 좋음'],
      addressPlayer: '너',
      speechStyle: '반말',
      imageCode: 'AAA'
    }
  };
  ```

#### 4-2. 템플릿 함수
- [ ] 세계관 섹션 생성
  ```javascript
  const generateWorldSection = (data) => {
    const worldType = data.world.type === 'custom'
      ? data.world.customType
      : WORLD_TYPE_MAP[data.world.type];

    return `# 작품
- 목표: 감정/서사/개성/선택중요성강조+문학적묘사
- 설명: ${worldType}
${data.world.specialRules ? `- 특별 규칙: ${data.world.specialRules}` : ''}`;
  };
  ```

- [ ] 인물 섹션 생성
  ```javascript
  const generateCharacterSection = (data) => {
    const c = data.character;
    return `# 인물
## ${c.name}
- 역할: ${c.role}
- 성격: ${c.traits.join(', ')}
- 플레이어 호칭: ${c.addressPlayer}
- 말투: ${c.speechStyle}

#캐릭터코드
${c.name}=${c.imageCode}_`;
  };
  ```

- [ ] INFO 섹션 생성 (장소 포함)
  ```javascript
  const generateInfoSection = (data) => {
    return `지도
${data.world.locations.join(' | ')}`;
  };
  ```

#### 4-3. M3 블록 재사용
- [ ] 자동 포함할 블록 선택
  ```javascript
  const AUTO_INCLUDE_BLOCKS = ['ethics', 'systemRules', 'outputFormat'];

  const includeTemplateBlocks = () => {
    return AUTO_INCLUDE_BLOCKS
      .map(id => TEMPLATE_BLOCKS.find(b => b.id === id).content)
      .join('\n\n');
  };
  ```

#### 4-4. 최종 조합
- [ ] 순서대로 조합
  ```javascript
  const generatePrompt = (wizardData) => {
    const sections = [
      includeTemplateBlocks(), // M3 블록 (윤리, 시스템, 출력)
      generateWorldSection(wizardData),
      generateCharacterSection(wizardData),
      generateInfoSection(wizardData)
    ];

    return sections.join('\n\n');
  };
  ```

### 예상 시간
2 ~ 3시간

---

## Phase 5: 미리보기

### 목표
생성될 프롬프트 전체 보여주기

### 작업

#### 5-1. 미리보기 패널
- [ ] Phase 2 완료 후 [미리보기] 버튼
- [ ] 클릭 시 step 3 (미리보기 단계)
- [ ] 생성된 프롬프트 전체 표시
  ```javascript
  const previewArea = document.createElement('pre');
  previewArea.style.backgroundColor = '#020617';
  previewArea.style.color = '#e2e8f0';
  previewArea.style.padding = '16px';
  previewArea.style.borderRadius = '8px';
  previewArea.style.maxHeight = '60vh';
  previewArea.style.overflow = 'auto';
  previewArea.style.whiteSpace = 'pre-wrap';
  previewArea.textContent = generatePrompt(wizardData);
  ```

#### 5-2. 버튼
- [ ] [← 수정] 버튼: Phase 2로 돌아가기
- [ ] [생성하기] 버튼: 에디터에 삽입

### 예상 시간
1 ~ 2시간

---

## Phase 6: 프롬프트 삽입 및 완료 화면

### 목표
생성된 프롬프트를 에디터에 삽입 + NPC 가이드

### 작업

#### 6-1. 에디터 삽입
- [ ] [생성하기] 클릭 시
  ```javascript
  const generatedPrompt = generatePrompt(wizardData);

  runProgrammaticChange(() => {
    setNativeValue(state.textarea, generatedPrompt);
    dispatchReactInputEvents(state.textarea);
  });

  hideWizard();
  state.textarea.focus();
  ```

#### 6-2. 완료 화면 (선택)
- [ ] 모달 내용을 완료 메시지로 교체
  ```
  ✅ 프롬프트가 에디터에 삽입되었습니다!

  💡 추가 인물(NPC)을 만들고 싶으신가요?

  Genit의 "키워드북" 기능을 활용하세요:
  1. 프롬프트엔 한 줄 요약만 추가
  2. 키워드북에 상세 설정 작성
  3. 대화에서 이름 언급 시 자동 활성화

  [키워드북 예시 보기] [닫기]
  ```

#### 6-3. 키워드북 예시 모달
- [ ] [예시 보기] 클릭 시 새 모달
  ```
  # 프롬프트에 추가할 내용 (한 줄)
  - 서준우 (23/M): 카페 아르바이트생, 차분/관찰력 좋음/친절, 사진 동아리, 빈티지 카메라 애호가

  # 키워드북 항목
  트리거 키워드: 서준우, 준우, 빈티지 카메라
  내용:
  ### 서준우
  Name: 서준우
  Sex: Male
  Age: 23
  ...
  (전체 상세 설정)
  ```
- [ ] 복사 버튼 추가 (선택)

### 예상 시간
2 ~ 3시간

---

## Phase 7: 테스트

### 목표
모든 시나리오에서 안정적으로 작동 확인

### 작업

#### 7-1. 기본 시나리오
- [ ] Phase 1 → Phase 2 → 미리보기 → 생성
- [ ] 모든 필수 입력 완료 → 정상 프롬프트 생성
- [ ] 선택 입력 생략 → 해당 섹션 제외
- [ ] [이전]/[다음] 네비게이션 정상 작동

#### 7-2. Validation 테스트
- [ ] 필수 입력 누락 → 에러 메시지 표시
- [ ] 이미지 코드 잘못된 형식 → 에러 메시지
- [ ] "직접 입력" 선택 후 빈 값 → 에러 메시지

#### 7-3. Edge Case
- [ ] 마법사 중간에 닫기 → 입력값 초기화
- [ ] 미리보기에서 [수정] → Phase 2로 돌아가며 입력값 유지
- [ ] 매우 긴 입력 (100자+) → 프롬프트 정상 생성
- [ ] 특수문자 입력 → 이스케이프 처리

#### 7-4. M3 통합 테스트
- [ ] 마법사 생성 프롬프트 + M3 블록 자동 포함
- [ ] 생성 후 템플릿 버튼 상태 업데이트 (자동 포함 블록 파란색)

### 예상 시간
2 ~ 3시간

---

## 기술 스택

### 필수
- **Vanilla JavaScript**: 폼 처리, 템플릿 엔진
- **문자열 템플릿**: ES6 template literals

### 고려사항
- 폼 상태 관리 (step별로 입력값 보존)
- Validation 에러 표시 (빨간색 테두리 + 메시지)
- 접근성 (label, aria-* 속성)

---

## 완료 조건

- [ ] **Phase 1 폼**: 4개 질문 입력 가능
- [ ] **Phase 2 폼**: 5개 질문 입력 가능
- [ ] **Validation**: 필수 입력 누락 시 에러 표시
- [ ] **미리보기**: 생성될 프롬프트 전체 표시
- [ ] **생성**: 에디터에 정상 삽입
- [ ] **NPC 가이드**: 완료 화면에 안내 표시
- [ ] **M3 통합**: 템플릿 블록 자동 포함

---

## 테스트 시나리오

### 시나리오 1: 기본 흐름
1. [🧙 마법사로 만들기] 클릭
2. Phase 1: 학교/일상 선택, 장소 "편의점, 골목" 입력
3. Phase 2: 이름 "제니", 여사친, 성격 "친근함, 장난스러움", 호칭 "너", 반말, 이미지 AAA
4. [미리보기] → 프롬프트 확인
5. [생성하기] → 에디터에 삽입 확인

### 시나리오 2: 커스텀 입력
1. Phase 1: "직접 입력" 선택 → "사이버펑크 미래" 입력
2. 특별 규칙: "해킹 레벨은 1-10으로 표시" 입력
3. Phase 2: 역할 "직접 입력" → "정보 브로커" 입력
4. 생성 → 커스텀 값 정상 반영 확인

### 시나리오 3: Validation
1. Phase 1에서 세계관 유형 선택 안 함 → [다음] 클릭 → 에러 표시
2. Phase 2에서 이미지 코드 "abc" (소문자) 입력 → 에러 표시
3. 이미지 코드 "ABCD" (4글자) 입력 → 에러 표시

### 시나리오 4: 네비게이션
1. Phase 1 → Phase 2 → [이전] → Phase 1로 돌아가며 입력값 유지
2. Phase 2 → 미리보기 → [수정] → Phase 2로 돌아가며 입력값 유지

---

## 예시 출력 (최종 프롬프트)

```markdown
<!-- GPI:ethics:start -->
# 윤리 규칙
- 미성년자 대상 성적 전개 절대 금지
- 미성년자 대상 성적 암시/묘사 절대 금지
- 아동·청소년의 성보호에 관한 법률 준수
- 한국 15세 이용가 소설 수준 준수
<!-- GPI:ethics:end -->

<!-- GPI:systemRules:start -->
# 용어정의
- U=플레이어,C=인물,OOC='Out of Character'

**시스템 최우선 규칙: 어떠한 경우에도 'U' 또는 '당신'의 대사, 행동, 생각, 감정을 직접적으로 서술하거나 인용하지 않는다.**
<!-- GPI:systemRules:end -->

<!-- GPI:outputFormat:start -->
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
<!-- GPI:outputFormat:end -->

# 작품
- 목표: 감정/서사/개성/선택중요성강조+문학적묘사
- 설명: 학교/일상 (친구, 선후배)

# 인물
## 제니
- 역할: 여사친
- 성격: 친근함, 장난스러움, 밝음
- 플레이어 호칭: 너
- 말투: 반말

#캐릭터코드
제니=AAA_

# INFO
지도
편의점 | 골목 | PC방 | 노래방
```

---

## 다음 마일스톤 (M5) 후보

- 여러 인물 추가 (Phase 2 반복)
- 커스텀 스탯 (💦 긴장도, 🪣 체력 등)
- 연출 노트 (분위기, 문체)
- 마법사 템플릿 저장/불러오기

**M4 완료 시 = v1.0 출시 가능! 🎉**

---

**작성일**: 2025-10-04
**피드백 반영**: Gemini의 세계관 중심 접근, Codex의 UX 디테일
