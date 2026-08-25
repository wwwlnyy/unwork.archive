# unwork.archive (2026Unithon-ScrapApp)

AI 기반 스크랩 저장 앱의 **프론트엔드(React Native / Expo)** 레포입니다.
다른 앱에서 콘텐츠를 "공유"만 하면 자동으로 저장하고, 나중에 자연어로 검색하면 AI가 가장 적합한 스크랩을 찾아주는 것을 목표로 합니다.

> 백엔드(Python, `unithon.fly.dev` / `ai-image-api.fly.dev`)는 별도 레포·별도 담당자가 개발하며 이 레포의 범위가 아닙니다.

## 개요

- 사용자가 SNS·브라우저 등 어떤 앱에서든 공유 시트로 이 앱을 선택하면, 콘텐츠가 즉시 백엔드로 전송되어 저장됩니다.
  - 블로그 등 텍스트 콘텐츠: 백엔드가 URL을 스크래핑하고 AI로 요약·키워드를 추출
  - 유튜브 등 스크래핑이 어려운 콘텐츠: 우선 링크만 저장 (사용자 직접 키워드 입력은 계획 중)
- 저장된 스크랩은 나중에 검색창에 자연어로 질의하면 AI가 정확히 일치하는 항목과 임베딩 기반 유사 항목을 함께 보여줍니다.
- 공유 저장은 React Native JS 레이어를 거치지 않고, **iOS Share Extension(Swift)** / **Android 공유 리시버(Kotlin)**가 메인 앱과 무관하게 네이티브에서 직접 백엔드를 호출합니다. 앱이 꺼져 있거나 Metro가 안 떠 있어도 저장이 동작합니다.

## 주요 기능

| 기능 | 상태 | 설명 |
|---|---|---|
| 공유로 저장 (iOS) | ✅ | `ShareExtensionViewController.swift` — App Group으로 로그인 토큰 공유, 텍스트로 전달되는 링크(유튜브 등)도 URL 추출해서 처리 |
| 공유로 저장 (Android) | ✅ | `ShareReceiverActivity.kt` — SharedPreferences로 로그인 토큰 공유 |
| 온보딩 · 소셜 로그인 UI | ✅ | 카카오 / 네이버 / 구글 원형 배지, SVG 아이콘 |
| 구글 로그인 | ✅ 실연동 | `@react-native-google-signin/google-signin`, `expo-secure-store`로 세션 영구 저장 및 앱 재실행 시 자동 복원 |
| 카카오 · 네이버 로그인 | 🚧 스텁 | 실제 SDK 미연동. 기기별 랜덤 ID로 로그인 처리(다른 기기 간 계정 연동 안 됨) |
| 검색 | ✅ | `POST /search` 연동, 응답 `mode`(정보성/경험형/탐색형/결과없음)에 따라 결과 화면 자동 분기 |
| 검색 결과 출처 바텀시트 | ✅ | 결과 화면에서 출처 뱃지 탭 시 원문 목록(썸네일/제목/작성자) 표시 |
| 내 스크랩 목록/조회 | ✅ | `GET /items`, 처리 중(`pending`/`processing`) 항목은 2초 간격 폴링, 썸네일 프리로드 후 목록 표시 |
| 스크랩 통계 | ✅ | `GET /stats`, 사이드바에 전체 스크랩 수 표시 |
| 스크랩 선택 삭제 | 🚧 UI만 | 백엔드 삭제 엔드포인트 스펙 미확정으로 API 연동 보류 |
| 요금제 화면 | 🚧 UI만 | 플랜 선택 UI만 존재, 실제 결제 로직 없음 |

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
│   ├── api/                      # authClient(unithon.fly.dev), contentClient(ai-image-api.fly.dev)
│   └── auth/                     # googleAuth.ts
└── navigation/RootNavigator.tsx  # 스택 네비게이션 정의

modules/app-group-storage/        # iOS App Group 기반 커스텀 네이티브 모듈
ios/, android/                    # expo prebuild로 생성된 네이티브 프로젝트 (git에 커밋됨)
```

## 개발 환경

- Mac + Xcode + Android Studio(에뮬레이터) 로컬 빌드 기준 (필요 시 EAS Build 클라우드 빌드도 사용)
- **Xcode 26.4 이상 필수** — 이보다 낮은 버전에서는 `expo-modules-jsi` 컴파일 실패 (Swift 6.2 strict 규칙 충돌, [expo/expo#47539](https://github.com/expo/expo/issues/47539))
- Android SDK: `$HOME/Library/Android/sdk`, AVD `Medium_Phone_API_36.1`

### 빠른 시작

```bash
npm install

# 시뮬레이터/에뮬레이터에서 바로 확인 (Debug + Metro, Fast Refresh)
npx expo run:ios
npx expo run:android

# 실기기에 배포/시연용 빌드 (Metro 없이 독립 실행)
npx expo run:ios --device "<기기 이름>" --configuration Release

# Android APK를 QR/링크로 배포 (EAS 클라우드 빌드)
npx eas build --profile preview --platform android
```

상세한 기기 연결·서명·트러블슈팅 절차는 [`CLAUDE.md`](./CLAUDE.md)에 정리되어 있습니다.

## 알려진 이슈

- **카카오/네이버 로그인 미구현**: 버튼을 눌러도 실제 인증 화면 없이 기기별 랜덤 ID로 로그인 처리됨. 다른 기기에서는 계정이 이어지지 않음.
- **구글 로그인, 기기 간 스크랩 미동기화(간헐적)**: 같은 `provider_id`로 재로그인해도 백엔드가 가끔 신규 계정으로 인식함(`is_new_user: true`). 백엔드가 유저 데이터를 영구 저장소가 아닌 메모리에 두고 있어, 서버 재시작 시 초기화되는 것으로 추정 — 백엔드 확인 필요.
- **스크랩 삭제 API 미확정**: 프론트 UI는 완성돼 있으나 `deleteItems`는 엔드포인트 스펙 확정 전까지 빈 구현.
- **무료 Apple ID 서명 인증서 7일 만료**: 실기기 배포 빌드는 7일마다 재빌드 필요.

## 현재 상태

- iOS/Android 실기기·에뮬레이터·시뮬레이터에서 빌드/설치/공유 저장/검색/내 스크랩 조회까지 전체 플로우 동작 확인
- 백엔드 연동(로그인, 검색, 스크랩 저장/조회/통계)은 완료, 삭제·결제·카카오/네이버 SDK는 후속 작업
