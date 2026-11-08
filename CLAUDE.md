# 모바일 초대장 웹페이지

스마트폰에서 보기 좋은 모바일 반응형 초대장 웹페이지. 행사일까지 남은 시간을 보여주는 D-Day와 장소 지도를 포함한다.

## 기술 제약

- **프레임워크·빌드 도구 금지**: 순수 HTML, CSS, 바닐라 JavaScript만 사용한다. (React, Vue, jQuery, Tailwind, Sass, npm 번들러 등 불가)
- 외부 라이브러리는 꼭 필요할 때만 CDN `<script>`로 추가하고, 추가 이유를 이 파일에 기록한다.
- 서버 없이 `index.html`을 열거나 정적 호스팅(GitHub Pages, Netlify 등)만으로 동작해야 한다.
- JS는 ES6+ 문법 사용 (const/let, 화살표 함수, 템플릿 리터럴). `var` 금지.

## 폴더 구조

```
invitation-webpage/
├── CLAUDE.md
├── index.html        # 단일 페이지, 시맨틱 마크업
├── css/style.css     # 스타일 (CSS 변수로 색상·폰트 관리)
├── js/main.js        # D-Day, 지도, 인터랙션
└── images/           # 이미지 (WebP/JPG 압축, 파일명은 영문 소문자-하이픈)
```

## 설정 한곳에 모으기

행사 정보는 HTML/JS 곳곳에 흩뿌리지 말고 `js/main.js` 상단의 `CONFIG` 객체 하나로 관리한다.

```js
const CONFIG = {
  eventName: '',
  eventDate: '2026-12-25T14:00:00+09:00', // ISO 8601, 반드시 시간대(+09:00) 포함
  venueName: '',
  address: '',
  lat: 0,
  lng: 0,
};
```

## 디자인·반응형 원칙

- **모바일 퍼스트**: 기본 CSS는 360~430px 폭 기준으로 작성하고 `@media (min-width: 768px)`로 태블릿/PC를 확장한다.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` 필수.
- 본문 폭은 PC에서도 `max-width: 480px` 정도로 가운데 정렬해 모바일 초대장 느낌을 유지한다.
- 단위는 `rem`/`%`/`clamp()` 우선, 고정 `px` 너비 지양. 가로 스크롤이 생기면 안 된다.
- 터치 대상(버튼, 링크)은 최소 44×44px.
- 본문 글자 16px 이상, 명암 대비 충분히 확보.
- 이미지는 `max-width: 100%`, `loading="lazy"`, `alt` 필수.
- 색상·폰트·간격은 `:root` CSS 변수로 정의해 한 곳에서 바꿀 수 있게 한다.
- 한글 폰트는 Google Fonts(Noto Serif KR / Noto Sans KR 등) 또는 시스템 폰트 폴백 사용. `word-break: keep-all` 적용.

## 기능 명세

### 1. D-Day 카운트다운
- `CONFIG.eventDate`까지 남은 **일/시/분/초**를 1초마다 갱신해 표시한다.
- `setInterval` 사용 시 탭이 백그라운드여도 정확하도록 매 tick마다 `Date.now()`와 목표 시각의 차이로 계산한다 (누적 감산 금지).
- 상단에 `D-123` 형태의 요약, 아래에 시:분:초 표시.
- 행사 당일은 `D-Day`, 이후에는 `행사가 종료되었습니다` 등 종료 문구로 전환하고 타이머를 멈춘다.
- 사용자 기기 시간대와 무관하게 행사 시간대(KST) 기준으로 계산한다.
- 숫자 영역에 `aria-live="off"`(초 단위 갱신이 스크린리더를 방해하지 않도록)와 정적 텍스트 대체 제공.

### 2. 장소 지도
- 약속 장소 이름, 주소, 지도를 한 섹션에 표시한다.
- 지도 방식 우선순위:
  1. **API 키가 필요 없는 방식 우선**: Google Maps `<iframe>` embed 또는 지도 서비스의 공유 iframe.
  2. 카카오맵/네이버지도 JS SDK를 쓸 경우 API 키는 코드에 하드코딩하지 말고 도메인 제한을 설정한 키만 사용, 키 값은 `CONFIG`에 두되 커밋 전에 사용자에게 확인한다.
- 지도 아래에 **길찾기 버튼**: 네이버지도 / 카카오맵 / 티맵 앱 딥링크 또는 웹 링크.
- **주소 복사** 버튼 (`navigator.clipboard.writeText`, 실패 시 `prompt` 폴백).
- iframe은 `loading="lazy"`, `title` 속성 필수, 폭 100%·높이 약 300px.

### 3. 기본 섹션 (필요에 따라 조정)
인사말 → 커버(이름/날짜) → D-Day → 일시·장소(지도) → 연락처(전화/문자 `tel:`/`sms:` 링크) → 마무리.

## 코드 규칙

- HTML: 시맨틱 태그(`header`, `main`, `section`, `footer`), 섹션마다 `id`와 제목(`h2`).
- CSS: BEM 비슷한 클래스 네이밍(`.countdown__item`), ID 선택자로 스타일링 금지, `!important` 지양.
- JS: 전역 변수 최소화, 기능별 함수 분리(`initCountdown`, `initMap`, `initCopyButton`), `DOMContentLoaded`에서 초기화.
- 주석과 UI 문구는 한국어, 변수·함수·클래스명은 영어.
- 들여쓰기 2칸, 세미콜론 사용, 작은따옴표 사용.
- 개인정보(전화번호, 계좌번호 등)는 사용자가 제공한 값만 사용하고 임의로 만들어 넣지 않는다. 더미 값은 `010-0000-0000`처럼 명확히 가짜로 표기.

## 개발·확인 방법

- 로컬 확인: `index.html`을 브라우저에서 직접 열거나 `npx serve .` / `python -m http.server`로 정적 서버 실행.
- 반드시 브라우저 개발자 도구의 **모바일 뷰(360px, 390px, 430px)** 와 PC 폭에서 모두 확인한다.
- 확인 체크리스트:
  - [ ] 가로 스크롤 없음
  - [ ] D-Day가 정확하고 종료 후 문구 전환됨 (`eventDate`를 과거/오늘/미래로 바꿔 테스트)
  - [ ] 지도 표시, 길찾기 링크, 주소 복사 동작
  - [ ] 콘솔 에러 없음
  - [ ] 이미지 용량 적정 (한 장당 대략 300KB 이하 권장)

## 작업 시 주의

- 요청받지 않은 기능(방명록, 음악, RSVP 등)은 임의로 추가하지 않고 먼저 제안한다.
- 파일을 새로 만들기보다 기존 파일(`index.html`, `style.css`, `main.js`) 수정을 우선한다.
- 행사 정보(날짜, 장소, 이름)가 정해지지 않았다면 추측하지 말고 사용자에게 물어본다.
