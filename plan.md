# UNITHON UI/UX 화면 구현 계획

Figma: https://www.figma.com/design/pHWPq4XpdWGCsNd7JrPJit/UNITHON-UI-UX (fileKey: `pHWPq4XpdWGCsNd7JrPJit`)

## 1. 아키텍처 (확정)

- **네이티브 RN 컴포넌트 + React Native Web**. 같은 코드가 모바일(iOS/Android)과 PC 웹(`expo start --web`)에 모두 빌드된다.
- 인증: 팀원 Auth 서버(`unithonapi.fly.dev`, 2026-08-26부터 `unithon.fly.dev`에서 이전)에서 로그인 → `access_token`(JWT, 60분 만료, 리프레시 없음)을 받아 Content API 호출마다 `Authorization: Bearer` 헤더로 첨부. **`user_id`를 프론트가 직접 만들거나 쿼리로 보내지 않는다** (과거엔 그랬으나 현재는 전부 토큰 기반으로 전환 완료). 구글 로그인은 `provider_id` 대신 구글 Access Token(`social_token`)을 서버가 직접 검증하는 방식으로 전환되어, 기기가 바뀌어도 같은 계정으로 매칭된다.
  - ⚠️ Content API(`/scrap`, `/search`, `/items`, `/stats`)는 여전히 `ai-image-api.fly.dev`에 있다 — `unithonapi.fly.dev`는 auth 전용이라 이 경로들이 없음(404). 2026-08-26에 받은 마이그레이션 문서는 "모든 API를 unithonapi.fly.dev로" 라고 안내했지만 실제 배포는 auth만 이전된 상태라 문서와 다름. `unithonapi.fly.dev`가 발급한 토큰은 `ai-image-api.fly.dev`에서 그대로 통한다(curl로 확인 완료).
- 공유 저장: iOS는 네이티브 Share Extension(Swift, `ios/2026UnithonScrapAppShareExtension/ShareExtensionViewController.swift`)이 공유받은 URL로 **직접** `POST /scrap` 호출. 메인 앱과 Extension은 별도 프로세스라 로그인 토큰을 공유해야 하는데, 이를 위해 App Group 기반 로컬 네이티브 모듈(`modules/app-group-storage`)을 만들어 로그인 시 토큰을 저장해둔다. (`expo-share-intent`는 이 방식 채택 후 iOS/Android 모두 비활성화됨 — JS 쪽에서 공유 데이터를 직접 다루지 않음.)

## 2. 진행 현황 (2026-08-25 기준)

### 완료

- **Phase 0 — 기반**: Pretendard 폰트, 디자인 토큰(`src/styles/`), React Navigation 스택(`RootNavigator`), 앱 아이콘 전체(iOS/Android/웹 파비콘)를 `assets/icon.svg` 기반으로 교체
- **Phase 1 — 온보딩/로그인**: 온보딩 화면, 소셜 로그인 UI(카카오/네이버/구글 — 전부 원형 배지 아이콘, `react-native-svg` 컴포넌트로 직접 작성: `KakaoIcon`/`NaverIcon`/`GoogleIcon`). 아이디/비밀번호 로그인은 사용자 확정으로 완전 제거. `POST /auth/login` 실연동 완료
- **Phase 1.5 — 구글 실 SDK 연동 + 로그인 유지**: `@react-native-google-signin/google-signin` 실연동(`src/lib/auth/googleAuth.ts`), Google Cloud Console에 Web/iOS/Android OAuth 클라이언트 3종 등록. `expo-secure-store`로 `accessToken`/`userId` 영구 저장 → 앱 재실행 시 `AuthContext`가 자동 복원, `RootNavigator`가 `isRestoring` 동안 대기 후 로그인 상태면 바로 Home으로 진입. 카카오/네이버는 아직 스텁(`{provider}-stub-...`)값 — 기기별로 SecureStore에 저장해 동일 기기에서는 같은 임시 계정으로 로그인되도록만 처리해둔 상태(Phase 9에서 교체 예정)
- **Phase 2 — 홈/사이드바/검색 UI**: 홈 화면, 사이드바(프로필/스크랩수/스크랩목록·요금제변경 진입/공지사항·고객센터), 검색 결과 화면 3종(정보성/경험형/빈 결과)
- **Phase 3 — 검색 API 연동**: `POST /search` 실연동, `mode`(informational/experiential/none)에 따라 결과 화면 자동 라우팅, 재검색 시 헤더 검색창/아이콘 탭 모두 동작
- **Phase 4 — 스크랩 저장/조회 API 연동**:
  - 공유 → Share Extension이 `POST /scrap` 직접 호출, 완료/실패 응답 받을 때까지 "저장 중..." 카드 유지
  - `MyScrapsScreen`을 `GET /items` 실연동으로 전환(mock 제거), `pending`/`processing` 항목이 있으면 2초 폴링, 화면이 이미 focus된 채로 앱만 포그라운드 복귀해도 `AppState` 리스너로 재조회
  - Auth 방식이 `user_id` → `Authorization: Bearer` 토큰으로 전환되면서 `contentClient.ts`, `useSearch`, `MyScrapsScreen`, App Group 모듈, Share Extension까지 전부 갱신 완료. 401 응답 시 `SessionExpiredError`로 로그아웃 + 로그인 화면 이동 처리

### 진행 중 / 확인 필요

- 실기기(iOS) Metro 연결 — 같은 WiFi에서도 클라이언트 격리로 LAN 접속이 안 되는 환경이라 `--tunnel`(ngrok)로 우회 중. 케이블 연결은 빌드/설치에만 쓰이고 JS 번들 로드는 별개라는 점 유의
- **네이티브 아이콘 리소스 캐시 이슈(중요, 재발 방지용 기록)**: `ios/`, `android/`는 `.gitignore`로 관리되는 생성 폴더지만, 이미 한 번 `expo prebuild`/`expo run`으로 생성된 뒤에는 `assets/icon.png` 등을 바꿔도 **자동으로 재생성되지 않는다.** 실제로 빌드에 반영되는 파일은:
  - iOS: `ios/2026UnithonScrapApp/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png` (직접 덮어씀, 완료)
  - Android: `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_{foreground,background,monochrome}.webp` + 레거시 `ic_launcher.webp`/`ic_launcher_round.webp` — 전 밀도 재생성 완료(직접 덮어씀), 앱 삭제 후 재설치로 캐시 갱신 확인
  - 아이콘류를 다시 바꿀 일이 있으면 `assets/*.png`뿐 아니라 위 native 리소스도 같이 갱신해야 함. 시뮬레이터/에뮬레이터는 껍데기 아이콘을 캐싱하는 경우가 있어 `xcrun simctl uninstall` 등으로 완전 삭제 후 재설치해야 확실히 반영됨

## 3. 다음 액션 (사용자 요청 4건, 우선순위 순)

### Phase 5 — 사이드바 스크랩 통계 (`GET /stats`) — 완료

- `contentClient.ts`에 `getStats(accessToken)` + `ScrapStats` 타입 추가 (`{ total, by_platform, by_category, by_status }`)
- `src/mocks/user.ts`의 `mockUser.scrapCount`(하드코딩) 제거, `HomeScreen`에서 사이드바를 열 때마다 `getStats` 호출해 실제 `total`을 `Sidebar`에 전달(실패 시 조용히 이전 값 유지)
- `by_platform`/`by_category`/`by_status`는 타입만 정의해두고 아직 UI에서는 미사용(추후 통계 화면에서 재사용 가능)

### Phase 6 — 검색 결과 출처 바텀시트 — 완료

- `SourceBadge`를 `Pressable`로 감싸 탭 가능하게 변경
- 신규 `src/components/SourceListSheet.tsx`: `Sidebar`와 동일한 `Modal`+`Animated` 슬라이드업 패턴으로 바텀시트 구현(새 라이브러리 설치 없음)
- `SearchResultInfoScreen`에서 뱃지 탭 시 `items[].platform`으로 필터링해 바텀시트에 원문 리스트(썸네일/제목/작성자) 표시, 항목 탭 시 `Linking.openURL`로 원문 오픈
- 이미 받은 `SearchResponse.items`를 클라이언트에서 필터링하는 방식이라 추가 API 호출 없음

### Phase 7 — 스크랩 선택 삭제 — UI만 완료, API 연동 보류

- **막힘(확인 필요)**: 삭제 엔드포인트 스펙 아직 미확정. `contentClient.ts`의 `deleteItem(id, accessToken)`은 TODO 주석과 함께 빈 구현으로 남겨둠 — 스펙 확정되면 fetch 호출만 채우면 됨
- `MyScrapsScreen`: 헤더의 "선택" 버튼으로 선택 모드 진입 → `ScrapCard`에 체크박스 오버레이 표시 → 하단 "선택한 N개 삭제" 바 탭 시 `Alert` 확인 후 `deleteItem` 호출(현재는 no-op) + 로컬 목록에서 즉시 제거
- `ScrapCard`에 `selectable`/`selected`/`onPress` prop 추가(체크박스는 아이콘 라이브러리 없이 `View` 스타일로 구현)

### Phase 8 — 요금제(Pay) 화면 — 완료

- `src/screens/pay/PlanSelectScreen.tsx` 신규 구현 — 스탠다드(5,900원)/프리미엄(9,900원) 플랜 카드(기능 목록은 임시 카피, Figma 정확한 수치 확인 전), 카드 탭으로 선택 상태 토글, "구독하기"는 "준비 중이에요" 알럿만 띄움 — 실제 결제 로직 없음
- `RootNavigator`에 `Pay` 라우트(모달 프레젠테이션)로 추가, 사이드바 "요금제 변경" → 이 화면으로 연결 완료

### Phase 9 — 카카오/네이버 실 SNS SDK 연동 (계획)

Google과 동일한 패턴(SDK 로그인 → `providerId`/`displayName` 추출 → `AuthContext.login(provider, providerId, displayName)` 호출)을 따른다. 두 개를 동시에 하지 않고 **카카오 → 네이버 순서로 하나씩** 붙이고, 매번 실기기(또는 에뮬레이터)에서 로그인 성공 + 앱 재시작 후 세션 유지까지 확인하고 다음으로 넘어간다.

공통 전제: 두 SDK 모두 네이티브 모듈이라 **설정 변경 후 반드시 재빌드 필요**. 이 프로젝트는 `ios/`, `android/`가 이미 생성돼 있는 상태라, `app.json`/config plugin만 바꾸고 끝나지 않고 **네이티브 파일(Info.plist, AndroidManifest.xml)을 직접 확인/수정**해야 반영되는 경우가 많다(구글 연동 때 Info.plist `CFBundleURLTypes`를 직접 추가해야 했던 것과 동일한 이유 — 이미 생성된 네이티브 프로젝트는 `expo run:*`이 plugin 변경분을 자동으로 재적용해주지 않음).

#### 9-1. 카카오 로그인

1. **콘솔 설정** — [Kakao Developers](https://developers.kakao.com)에서 앱 생성 → "네이티브 앱 키" 발급
   - 플랫폼 등록: iOS(Bundle ID `com.wwwlnyy.x2026UnithonScrapApp`), Android(패키지명 동일 + **키 해시** 등록 — SHA-1과는 다른 별도 포맷, `keytool`로 뽑은 인증서를 카카오 전용 명령/스크립트로 변환해야 함. 로컬 디버그 키스토어용 + EAS 릴리즈 키스토어용 둘 다 등록해야 로컬 테스트와 배포 빌드 둘 다 됨 — 구글 때 SHA-1 두 개 등록했던 것과 같은 이유)
   - 카카오 로그인 활성화, 동의 항목에서 "닉네임", "프로필 사진" 최소 동의로 설정(이메일은 비즈 심사 필요할 수 있어 이번 범위에서는 제외 권장)
2. **패키지 설치**: `@react-native-seoul/kakao-login` (Expo config plugin 지원, 커스텀 네이티브 코드 작성 불필요)
3. **`app.json`**: plugins 배열에 `["@react-native-seoul/kakao-login", { "kakaoAppKey": "<네이티브 앱 키>" }]` 추가
4. **네이티브 파일 직접 확인**(재빌드 후):
   - iOS `Info.plist`: `kakao{NATIVE_APP_KEY}` URL scheme + `LSApplicationQueriesSchemes`에 `kakaokompassauth`, `kakaolink` 추가됐는지 확인, 안 됐으면 구글 때처럼 수동 추가
   - Android `AndroidManifest.xml`: 카카오 관련 `meta-data`/`intent-filter` 반영 확인
5. **코드**: `src/lib/auth/kakaoAuth.ts` 신규(구글 `googleAuth.ts`와 동일 형태) — `KakaoLogin.login()` → `KakaoLogin.getProfile()`로 `id`, `nickname` 추출 → `{ providerId: profile.id, displayName: profile.nickname }` 반환
6. **`LoginScreen.tsx`**: `resolveProviderProfile`의 카카오 스텁 분기를 `signInWithKakao()` 호출로 교체
7. 재빌드 → 실기기 로그인 테스트 → 앱 완전 종료 후 재실행해 세션 유지 확인

#### 9-2. 네이버 로그인

1. **콘솔 설정** — [Naver Developers](https://developers.naver.com)에서 애플리케이션 등록 → Client ID/Secret 발급
   - iOS/Android 앱 정보 등록: Bundle ID/패키지명 + Android는 마찬가지로 서명 인증서 정보 필요
   - 사용 API에 "네이버 로그인" 추가, 제공 정보 선택(이름/닉네임/프로필 사진 등 — 필요한 최소한만)
2. **패키지 설치**: `@react-native-seoul/naver-login` (Expo config plugin 지원)
3. **`app.json`**: plugins에 `["@react-native-seoul/naver-login", { "consumerKey": "...", "consumerSecret": "...", "appName": "unwork.archive", "urlScheme": "naver<clientId>" }]` 형태로 추가(패키지 문서 기준 정확한 옵션명 재확인 필요)
4. **네이티브 파일 직접 확인**(재빌드 후): iOS `Info.plist`에 네이버 URL scheme 반영 여부 확인 후 수동 추가, Android `AndroidManifest.xml`도 동일하게 확인
5. **코드**: `src/lib/auth/naverAuth.ts` 신규 — 로그인 성공 콜백에서 프로필 조회 API로 `id`, `name`(또는 `nickname`) 추출 → `{ providerId, displayName }` 반환
6. **`LoginScreen.tsx`**: 네이버 스텁 분기를 `signInWithNaver()` 호출로 교체
7. 재빌드 → 실기기 로그인 테스트 → 세션 유지 확인

#### 완료 기준

- 카카오/네이버 각각 실기기에서 로그인 성공 → `Sidebar`에 실제 닉네임/이름 표시 (구글과 동일하게 `mockUser.name` 대체)
- 앱 완전 종료 후 재실행 시 재로그인 없이 이전 세션 유지 (SecureStore 복원 — `AuthContext`는 이미 provider-agnostic이라 추가 수정 불필요)
- 기존 구글 로그인 플로우에 회귀(regression) 없는지 확인

## 4. 리스크 / 열린 질문

- **삭제 API 미확정** (Phase 7 블로커) — 위 참고
- **access_token 60분 만료, 리프레시 없음** → 이미 401 감지 시 로그아웃 처리 구현됨. 사용성 개선(만료 임박 안내 등)은 아직 없음
- **카카오/네이버 실 SDK 미연동** (Phase 9 계획 참고) — 구글은 실연동 완료. 카카오는 "키 해시" 등록(SHA-1과 다른 별도 포맷), 네이버는 Client ID/Secret 발급이 각각 선행돼야 하고, 둘 다 콘솔 설정 → 재빌드 → 네이티브 파일 수동 확인이라는 동일한 패턴을 반복해야 함
- **Android 앱 아이콘 리소스 미반영** — 위 "진행 중" 항목 참고, 다음 세션에서 우선 처리
- **바텀시트/삭제 선택 모드 등 신규 UI는 새 패키지 설치 없이 RN 코어로 구현** 원칙 유지(이번 세션에 네이티브 재빌드를 여러 번 겪었기 때문 — 불필요한 네이티브 의존성 추가는 최대한 피함)
- **폴링 정리**: `MyScrapsScreen`의 2초 폴링은 화면 unfocus 시 정리되도록 이미 구현됨 — 바텀시트/삭제 기능 추가 시에도 동일 원칙 유지
