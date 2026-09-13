# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # tsc -b 타입 검사 후 dist/ 로 빌드
npm run preview    # 빌드 결과 확인
npm run typecheck  # 타입만 빠르게 검사
```

> 상위 디렉터리 `web/` 프로젝트가 5173을 쓰고 있을 수 있다. 충돌하면 `npx vite --port 5191 --strictPort`.

테스트 프레임워크도 린터도 없다. 변경 후 검증은 `npm run build`와 아래 방식이 전부다.

**DOM에 의존하지 않는 모듈은 번들해서 node로 직접 돌린다.** `src/lib/` 아래는 전부 이렇게 검증할 수 있고, 원판 수학처럼 눈으로 확인하기 어려운 것은 반드시 이 방법을 쓸 것.

```bash
npx esbuild src/lib/wheel.ts --bundle --format=esm --outfile=/tmp/wheel.mjs
# storage.ts는 localStorage를 스텁으로 주입해서 돌린다
```

**컴포넌트는 `react-dom/server`로 렌더해 스모크 테스트한다.** 진입 파일을 프로젝트 루트에 두어야 `node_modules`가 풀린다.

```bash
npx esbuild __smoke.tsx --bundle --format=esm --platform=node \
  --packages=external --jsx=automatic --loader:.css=empty --outfile=__smoke.mjs
node __smoke.mjs
```

렌더 결과를 문자열로 검사할 때는 React가 텍스트 노드 사이에 넣는 `<!-- -->` 마커를 먼저 걷어낼 것 — 그러지 않으면 `총 9개` 같은 문자열이 매칭되지 않아 멀쩡한 코드가 실패로 보인다.

## 사양 원본

`requirement.md`가 이 저장소의 사양 원본이다. 코드 주석은 `(37절)`처럼 해당 절 번호를 달아 두었으니, 왜 이렇게 되어 있는지 궁금하면 그 절을 먼저 볼 것.

> 상위 디렉터리의 `/Users/mac/test0913/CLAUDE.md`가 컨텍스트에 함께 로드되지만, 그것은 `hello.py`와 `web/`을 다루는 **무관한 프로젝트**의 문서다. 여기서는 따르지 않는다.

## 만들려는 것

행사·강의·사내 이벤트에서 경품을 무작위 추첨하는 단일 화면 웹앱. 로그인 없음, 서버 없음, 브라우저 안에서 끝난다.

성공 기준은 기능 개수가 아니라 속도다 — **접속 후 30초 안에 경품을 등록하고 첫 추첨을 돌릴 수 있어야 한다** (`requirement.md` 42절). 설정 단계를 늘리는 변경은 이 기준과 충돌하는지 먼저 따져볼 것.

## 스택

Vite + React 19 + TypeScript, Tailwind CSS v4, 원판은 **SVG**, confetti는 `canvas-confetti`, 아이콘은 `lucide-react`.

사양(33절)이 권한 것 중 두 가지는 쓰지 않았다.

- **Next.js 대신 Vite.** 서버도 라우팅도 SEO 요구도 없는 단일 화면이라 정적 번들이면 충분하다.
- **Framer Motion 대신 직접 돌리는 rAF.** 원판은 프레임마다 어느 칸이 포인터를 지나는지 알아야 tick 소리를 낼 수 있다(9절). 애니메이션 라이브러리에 맡기면 그 훅이 없다. `LuckyWheel`이 `requestAnimationFrame`으로 `<g>`의 `transform`을 직접 갱신하므로 **회전 중에는 React 리렌더가 일어나지 않는다** — 이 구조를 상태 기반 애니메이션으로 바꾸면 60fps마다 트리 전체가 다시 그려진다.

## 모듈 경계

| 파일 | 책임 |
|---|---|
| `src/App.tsx` | 상태 소유(`prizes`/`history`/`settings`), 추첨 흐름, 단축키, 레이아웃 |
| `src/lib/wheel.ts` | 칸 계산·회전 계획·각도 수학. **DOM을 모른다** |
| `src/lib/storage.ts` | localStorage 직렬화 — 유일한 저장소 접근 지점 |
| `src/lib/random.ts` | `crypto` 기반 난수와 가중 추첨 |
| `src/lib/catalog.ts` | 팔레트·색 배정·샘플·추천 목록 |
| `src/lib/color.ts` | 휘도 계산 → 칸 위 글자색 |
| `src/lib/sound.ts` | Web Audio 합성음 |
| `src/components/` | 사양 34절의 컴포넌트 구조 그대로 |

`src/lib/` 아래는 전부 순수 함수이거나 DOM 의존이 얇다. 새 로직을 넣을 곳을 고를 때 이 경계를 지키면 node로 바로 검증할 수 있다.

## 알고 있어야 할 결정들

**당첨자를 먼저 뽑고, 각도는 거기에 맞춰 역산한다** (37절). `planSpin()`이 가중 추첨으로 `winnerIndex`를 정한 뒤 그 칸이 포인터 아래 오도록 `targetRotation`을 계산한다. 애니메이션은 결과를 만들지 않고 이미 정해진 곳으로 데려다줄 뿐이다. 이 방향을 뒤집으면(멈춘 위치를 읽어 당첨자를 정하면) 확률 설정과 수량 처리가 전부 어긋난다.

**호의 크기와 당첨 확률은 같은 `share` 하나에서 나온다** (13절). `buildSegments()`가 정규화한 `share`로 `sweep`(호)을 그리고, `planSpin()`이 같은 `share`로 추첨한다. 둘을 따로 계산하면 화면과 결과가 갈라진다 — 40% 경품이 좁은 칸에서 계속 나오는 식이다. 확률을 켰는데 가중치가 전부 0이면 빈 원판 대신 균등으로 되돌린다.

**칸(`Segment[]`)은 파생 상태다.** `prizes`에서 수량 0을 걸러 매번 만든다(11절). 따로 들고 있지 말 것. 단 하나의 예외가 `App`의 `spinSegmentsRef` — 회전이 끝났을 때 당첨 칸을 되짚으려면 **계획 당시의** 배열이 필요하다.

**`removeWinner`는 "수량 차감"으로 해석했다.** 사양 11절(수량 1 감소, 0이면 제거)과 29절(당첨 경품 자동 제거, 기본 ON)이 겹치는데, 29절을 "경품 항목 통째로 제거"로 읽으면 `커피 쿠폰 ×5` 같은 기본 샘플이 한 번 만에 사라진다. 그래서 켜면 차감·0에서 제거, 끄면 차감하지 않고 반복 당첨 허용으로 두었다. 항목을 통째로 없애는 것은 당첨 모달의 `당첨 경품 제거` 버튼(10절)이 맡는다.

**랜덤은 `crypto.getRandomValues()`를 우선 쓴다** (30절). `Math.random()`은 폴백.

**브라우저 저장소는 신뢰하지 않는다.** `load()`는 어떤 경우에도 throw하지 않는다 — 시크릿 모드·사이트 데이터 차단·용량 초과에서는 `localStorage` 접근 자체가 던진다. 읽기·쓰기 모두 try/catch로 감쌌고, 저장 실패는 무시하고 화면 동작을 막지 않는다. 항목 단위로 검증해 한 건이 깨져도 나머지는 살린다. `storage.ts`를 고칠 때 이 성질을 유지할 것.

**사운드는 오디오 파일 없이 Web Audio로 합성한다** (9절). 행사장이 오프라인이거나 에셋 로딩이 느려도 소리가 난다. `AudioContext`는 자동재생 정책 때문에 첫 사용자 조작 시점에 만든다(`primeAudio()`).

**접근성은 사양에 포함된 요구사항이다** (32절). 버튼 최소 높이 44px, 키보드 접근, `aria-live`로 당첨 알림, 그리고 **색상만으로 결과를 구분하지 않는다**. 칸 위 글자색은 `readableTextColor()`가 배경 휘도를 보고 정한다 — 팔레트의 노란색(`#EAB308`) 위에서 흰 글씨는 읽히지 않는다.

**전체화면·발표용 모드는 설정 패널을 숨기고 원판만 키운다** (23·24절). 전체화면에 들어가면 발표용 모드가 따라 켜진다. 레이아웃은 패널 없이도 성립해야 한다. 단축키 Space / R / F / ESC도 같은 맥락이다(25절). 입력 중이거나 버튼에 포커스가 있을 때는 단축키를 삼키지 않는다(`isTypingTarget`).

## 범위

MVP(39절)는 전부 구현되어 있다. 40절의 참가자 이름 추첨·QR 참여·AI 경품 추천은 Version 2 후보이니 요청받기 전에 미리 만들지 말 것.
