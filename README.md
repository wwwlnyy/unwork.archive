# unwork.archive (2026Unithon-ScrapApp)

AI 기반 스크랩 저장 앱의 **프론트엔드(React Native / Expo)** 레포입니다.
다른 앱에서 콘텐츠를 "공유"만 하면 자동으로 저장하고, 나중에 자연어로 검색하면 AI가 가장 적합한 스크랩을 찾아주는 것을 목표로 합니다.

> 백엔드(Python)는 별도 레포에서 개발합니다. 인증(로그인/로그아웃)은 `unithonapi.fly.dev`, 그 외 스크랩·검색 등 콘텐츠 API는 `ai-image-api.fly.dev`에 있습니다(두 서버가 같은 access token을 공유).

## 개요

- 사용자가 SNS·브라우저 등 어떤 앱에서든 공유 시트로 이 앱을 선택하면, 콘텐츠가 즉시 백엔드로 전송되어 저장됩니다.
  - 블로그 등 텍스트 콘텐츠: 백엔드가 URL을 스크래핑하고 AI로 요약·키워드를 추출
  - 유튜브 등 스크래핑이 어려운 콘텐츠: 우선 링크만 저장 (사용자 직접 키워드 입력은 계획 중)
- 저장된 스크랩은 나중에 검색창에 자연어로 질의하면 AI가 정확히 일치하는 항목과 임베딩 기반 유사 항목을 함께 보여줍니다.
- 공유 저장은 React Native JS 레이어를 거치지 않고, **iOS Share Extension(Swift)** / **Android 공유 리시버(Kotlin)**가 메인 앱과 무관하게 네이티브에서 직접 백엔드를 호출합니다. 앱이 꺼져 있거나 Metro가 안 떠 있어도 저장이 동작합니다.

## 주요 기능

| 기능                    | 상태      | 설명                                                                                                                                                                                                                             |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 공유로 저장 (iOS)       | ✅        | `ShareExtensionViewController.swift` — App Group으로 로그인 토큰 공유, 텍스트로 전달되는 링크(유튜브 등)도 URL 추출해서 처리                                                                                                     |
| 공유로 저장 (Android)   | ✅        | `ShareReceiverActivity.kt` — SharedPreferences로 로그인 토큰 공유                                                                                                                                                                |
| 온보딩 · 소셜 로그인 UI | ✅        | 카카오 / 네이버 / 구글 원형 배지, SVG 아이콘                                                                                                                                                                                     |
| 구글 로그인             | ✅ 실연동 | `@react-native-google-signin/google-signin`으로 획득한 Access Token(`social_token`)을 서버가 직접 검증 — 기기와 무관하게 항상 같은 계정으로 로그인·스크랩 동기화. `expo-secure-store`로 세션 영구 저장 및 앱 재실행 시 자동 복원 |
| 카카오 · 네이버 로그인  | 🚧 스텁   | 실제 SDK 미연동. 기기별 랜덤 ID로 로그인 처리(다른 기기 간 계정 연동 안 됨)                                                                                                                                                      |
| 검색                    | ✅        | `POST /search` 연동, 응답 `mode`(정보성/경험형/탐색형/결과없음)에 따라 결과 화면 자동 분기                                                                                                                                       |
| 검색 결과 출처 바텀시트 | ✅        | 결과 화면에서 출처 뱃지 탭 시 원문 목록(썸네일/제목/작성자) 표시                                                                                                                                                                 |
| 내 스크랩 목록/조회     | ✅        | `GET /items`, 처리 중(`pending`/`processing`) 항목은 2초 간격 폴링, 썸네일 프리로드 후 목록 표시                                                                                                                                 |
| 스크랩 통계             | ✅        | `GET /stats`, 사이드바에 전체 스크랩 수 표시                                                                                                                                                                                     |
| 스크랩 선택 삭제        | ✅        | `POST /items/delete` 연동, 목록에서 항목 선택 후 일괄 삭제                                                                                                                                                                       |
| 요금제 화면             | 🚧 UI만   | 플랜 선택 UI만 존재, 실제 결제 로직 없음                                                                                                                                                                                         |

## 기술 스택

- **Expo SDK 57** (TypeScript)
- **React Navigation** (Native Stack)
- **expo-secure-store**: 로그인 세션(access token) 영구 저장
- **expo-share-extension** (iOS) / 네이티브 Kotlin Activity (Android): 공유 인텐트 수신
- **@react-native-google-signin/google-signin**: 구글 OAuth
- **react-native-svg**: 아이콘 컴포넌트
- 커스텀 App Group 네이티브 모듈(`modules/app-group-storage`): 메인 앱 ↔ iOS Share Extension 간 로그인 토큰 공유
- bare workflow 필요 (`expo-share-extension` 등 네이티브 모듈 포함 — **Expo Go 사용 불가**, dev client 빌드로만 테스트 가능)

## 프로젝트 구조

```
App.tsx                          # SafeAreaProvider + AuthProvider + RootNavigator 엔트리포인트
src/
├── screens/
│   ├── onboarding/               # 온보딩
│   ├── auth/                     # 로그인 (구글 실연동 / 카카오·네이버 스텁)
│   ├── home/                     # 홈 (검색 입력, 사이드바 진입)
│   ├── search/                   # 검색 결과 화면 4종 (정보성/경험형/탐색형/빈결과)
│   ├── scrap/                    # 내 스크랩 목록
│   └── pay/                      # 요금제 선택 (UI만)
├── components/                   # Sidebar, ScrapCard, SourceListSheet, 아이콘 등
├── context/AuthContext.tsx       # 로그인 세션 상태 + SecureStore 영속화
├── lib/
│   ├── api/                      # authClient(unithonapi.fly.dev), contentClient(ai-image-api.fly.dev)
│   └── auth/                     # googleAuth.ts
└── navigation/RootNavigator.tsx  # 스택 네비게이션 정의

modules/app-group-storage/        # iOS App Group 기반 커스텀 네이티브 모듈
ios/, android/                    # expo prebuild로 생성된 네이티브 프로젝트 (git에 커밋됨)
```

## 개발 환경

- Mac + Xcode + Android Studio(에뮬레이터) 로컬 빌드 기준 (필요 시 EAS Build 클라우드 빌드도 사용)
- **Xcode 26.4 이상 필수** — 이보다 낮은 버전에서는 `expo-modules-jsi` 컴파일 실패 (Swift 6.2 strict 규칙 충돌, [expo/expo#47539](https://github.com/expo/expo/issues/47539))
- Android SDK: `$HOME/Library/Android/sdk`, AVD `Medium_Phone_API_36.1`

## 실행 방법

### 1. Android — APK 다운로드로 바로 설치 (개발 환경 불필요)

빌드 없이 안드로이드 기기에서 바로 시연해볼 수 있습니다.

1. 안드로이드 기기에서 아래 링크를 엽니다. 브라우저가 자동으로 APK 파일을 다운로드합니다.
   👉 https://expo.dev/artifacts/eas/L7dxv4WJz7FZ0i6WthBRV_TH7EQj1iLqJM5dF6v0WiM.apk
2. 다운로드가 끝나면 알림 또는 파일 앱에서 다운로드된 `.apk` 파일을 탭해 실행합니다.
3. "출처를 알 수 없는 앱" 경고가 뜨면 **설정 > 이 출처 허용** (또는 팝업에서 바로 "허용")을 눌러줍니다. 브라우저나 파일 관리자 앱 단위로 한 번만 허용하면 됩니다.
4. 다시 설치를 진행하면 앱이 정상적으로 설치·실행됩니다. Google Play Protect가 추가로 경고할 수 있는데, "무시하고 설치"를 선택하면 됩니다.

> 이 APK는 `eas.json`의 `preview` 프로필(`distribution: internal`, `buildType: apk`)로 빌드된 standalone 빌드라, Metro 서버 없이 완전히 독립적으로 동작합니다.

### 2. iOS 시뮬레이터 — 소스 클론해서 로컬 빌드 (Mac 필요)

iOS 시뮬레이터는 macOS(Xcode)에서만 실행되므로, 다른 컴퓨터에서 확인하려면 그 컴퓨터도 Mac이어야 합니다. 시뮬레이터 실행에는 Apple 개발자 계정이나 서명이 필요 없습니다.

**사전 준비**

- Xcode 26.4 이상 (이보다 낮으면 `expo-modules-jsi` 컴파일 실패 — [expo/expo#47539](https://github.com/expo/expo/issues/47539))
- Node.js, npm

**실행 순서**

```bash
# 1. 레포 클론
git clone https://github.com/wwwlnyy/2026Unithon-ScrapApp.git
cd 2026Unithon-ScrapApp

# 2. 의존성 설치
npm install

# 3. 시뮬레이터 부팅 + 빌드 + 설치 + Metro 실행 (한 번에 처리됨)
npx expo run:ios
```

- 최초 실행 시 iOS 시뮬레이터가 자동으로 켜지고, 지정된 기본 시뮬레이터가 없으면 Xcode에서 하나 골라줍니다.
- 빌드가 끝나면 앱이 시뮬레이터에 자동 설치·실행되고, 이후 JS 코드만 고치면 재빌드 없이 Metro가 Fast Refresh 해줍니다.
- 이 명령어는 종료되지 않고 터미널에 로그를 계속 스트리밍하니, 백그라운드로 돌리지 말고 그대로 켜둔 채 확인하면 됩니다.
- 백엔드가 `unithonapi.fly.dev`(인증) / `ai-image-api.fly.dev`(콘텐츠) 원격 서버라 로컬 백엔드 세팅 없이 어느 네트워크에서든 바로 됩니다.

### 3. iOS 실기기 — 케이블 연결해서 Release 빌드 (Mac + iPhone/iPad 필요)

Metro 없이 하루 종일 독립 실행되는 시연용 빌드입니다.

1. iPhone/iPad를 케이블로 Mac에 연결합니다. (이미 페어링된 기기라면 이후엔 Wi-Fi로도 가능)
2. 기기 잠금을 풀고 "이 컴퓨터를 신뢰하시겠습니까?" 알림이 뜨면 **신뢰**를 누릅니다. (최초 1회)
3. 연결된 기기 목록과 이름을 확인합니다.
   ```bash
   xcrun devicectl list devices
   ```
4. (최초 1회만) Xcode에서 서명 팀을 설정합니다. 이미 설정돼 있다면 생략 가능합니다.
   ```bash
   open ios/*.xcworkspace
   ```
   왼쪽 TARGETS에서 `2026UnithonScrapApp`, `ShareExtension` **두 타겟 모두** Signing & Capabilities 탭 → Team을 본인 Apple ID로 지정합니다. (무료 개인 계정으로도 가능)
5. 레포를 클론하지 않았다면 위 "iOS 시뮬레이터" 섹션의 1~2단계(git clone, npm install)를 먼저 진행합니다.
6. 실기기용 Release 빌드로 설치합니다. `<기기 이름>`은 3번에서 확인한 이름 또는 UDID를 그대로 넣습니다.

   ```bash
   npx expo run:ios --device "<기기 이름>" --configuration Release
   ```

   - `--configuration Release`가 핵심입니다. JS 번들이 앱에 통째로 박혀서, 설치 후에는 케이블도 Metro 서버도 없이 완전히 독립적으로 실행됩니다.
   - 설치가 끝나면(`Installing ... Complete 100%`) 케이블을 뽑아도 됩니다.

7. 최초 실행 시 기기에 "신뢰되지 않은 개발자" 팝업이 뜨면: **설정 > 일반 > VPN 및 기기 관리** 에서 본인 Apple ID를 신뢰 처리한 뒤 앱 아이콘을 다시 탭해 실행합니다.
8. 무료 Apple ID 인증서는 7일마다 만료됩니다. 만료되면 케이블을 다시 연결하고 6번 명령어를 그대로 재실행하면 됩니다.

기기 연결 오류(페어링 깨짐, Developer Mode, iOS 버전 미설치 등) 트러블슈팅은 [`CLAUDE.md`](./CLAUDE.md)에 더 자세히 정리되어 있습니다.

## 알려진 이슈

- **카카오/네이버 로그인 미구현**: 버튼을 눌러도 실제 인증 화면 없이 기기별 랜덤 ID로 로그인 처리됨(서버 전송 시에는 `device` provider로 매핑). 다른 기기에서는 계정이 이어지지 않음.
- **무료 Apple ID 서명 인증서 7일 만료**: 실기기 배포 빌드는 7일마다 재빌드 필요.

## 현재 상태

- iOS/Android 실기기·에뮬레이터·시뮬레이터에서 빌드/설치/공유 저장/검색/내 스크랩 조회까지 전체 플로우 동작 확인
- 백엔드 연동(로그인, 검색, 스크랩 저장/조회/통계)은 완료, 결제·카카오/네이버 SDK는 후속 작업
