# Colortelier (Frontend)

React + Vite + TypeScript 기반의 갤러리·디지털 판매 프론트엔드입니다. 백엔드는 별도 레포지토리에서 구현합니다.

## 제공 기능 (프론트 전용 구현 현황)

- 컬러 아카이빙(관리자 UI)
  - HEX 입력 시 RGB/CMYK 자동 계산 표시
  - 커스텀 컬러 코드 문법 빌더(드롭다운/입력)
  - 생성된 코드 미리보기 + Copy 버튼
  - 저장/업로드는 백엔드 연동 시 활성화 예정
- 보색 추천
  - 기본 색을 입력하면 무료 4가지/프리뷰 16가지 색상 제안
  - 프리미엄 상세 정보/잠금 해제는 결제 연동 후 제공 예정
- 컬러 팔레트 검색
  - 도메인/국가/도시/세부/날씨/시간/주제 드롭다운으로 조건 일부만 선택 가능
  - 결과는 목업 카드 그리드로 표시(백엔드 연결 전)
- 필터 갤러리(라이트룸 프리셋)
  - Before/After 썸네일 카드 그리드
  - 정확한 프리셋 값 노출은 결제 연동 후 제공 예정
- 마이페이지(목업)
  - 로그인/찜/구매내역 등은 백엔드·인증 연동 후 제공 예정

## 탭 / 경로

- `/` Main
  - 히어로 섹션과 여행지 팔레트형 카드 미리보기
- `/palettes` Color Palettes
  - 상단 필터 바(도메인/국가/도시/세부/날씨/시간/주제/검색), 결과 카드 그리드
- `/filters` Filters
  - 라이트룸 Before/After 카드 갤러리(목업 이미지)
- `/me` My Page
  - 인증/프로필/즐겨찾기/구매내역 등은 추후 연동
- `/admin` Admin
  - 컬러 아카이빙 UI + 보색 추천 도구

## 커스텀 컬러 코드 문법

형식:

```
[도메인1][국가2]-[도시3]-[세부3]-[날씨2]-[시간2](-[주제2])//[색상슬러그]
```

- 도메인(1): L=장소, F=음식, O=오브젝트, P=사람, A=예술, N=자연
- 국가(2): 사용자 정의 번호(예: 한국01, 일본02, 미국03 …)
- 도시(3): 로마자 3자(예: TYO, SEL, OSA)
- 세부(3): 동네/지구 3자(예: SHN, HND). 모르면 `XXX`
- 날씨(2): CL, OV, RA, SN, FG, HZ, ST
- 시간(2): MR, DT, EV, NT, GD, BL
- 주제(2, 선택): SK, FD, DR, TX, PT, PL …
- 색상슬러그: 자유 네이밍(한글/영문), 공백 대신 `-`

예시:

```
L02-SEL-HND-CL-GD(PL)//shiroi-kumo
F01-SEL-XXX-OV-EV(FD)//초록-인절미
```

## 개발 환경

1. 의존성 설치

```bash
npm i
```

2. 환경 변수(`.env.local`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

3. 개발 서버 실행

```bash
npm run dev
```

- 기본 포트: http://localhost:5173
- Vite 7 사용 시 Node 20.19+ 권장

## 스크립트

- `npm run dev`: Vite 개발 서버 실행
- `npm run build`: 타입체크 + 프로덕션 번들 빌드
- `npm run preview`: 빌드 결과 프리뷰
- `npm run lint`: ESLint 실행

## 디렉토리 구조(요약)

```
src/
  components/
    BeforeAfterCard.tsx
    AdminColorArchiver.tsx
    ComplementRecommender.tsx
  routes/
    RootLayout.tsx
    MainPage.tsx
    PalettePage.tsx
    FiltersPage.tsx
    MyPage.tsx
    AdminPage.tsx
  store/
    ui.ts
  utils/
    color.ts  # HEX/RGB/CMYK/HSL 변환, 보색 계산
```

## 기술 스택

- React 19, Vite, TypeScript
- React Router, Zustand
- Supabase JS(클라이언트 초기화만, 실제 읽기/쓰기 연동은 별도 백엔드 레포에서)

## 로드맵(프론트 관점)

- [ ] 다크 테마/테마 토글
- [ ] 팔레트/필터 상세 페이지 라우팅
- [ ] WCAG 대비 배지/정렬 기준 추가(보색 추천)
- [ ] 파일 업로드 UI(프런트), 업로드 진행률/썸네일 처리
- [ ] i18n(영문 UI 기본, 한글 추가 가능)
