@AGENTS.md

# 2026Unithon-ScrapApp

AI 기반 스크랩 저장 앱의 **프론트엔드(React Native/Expo)** 레포. 백엔드(Python)는 별도 레포/별도 담당자가 작업하며 이 레포의 범위가 아니다.

## 제품 개요

- 사용자가 다양한 앱/사이트에서 "공유" 버튼 → 이 앱을 선택하면 콘텐츠가 즉시 저장됨
  - 블로그 등 텍스트 콘텐츠: 백엔드가 URL을 스크래핑 → AI가 요약/키워드 추출 후 저장
  - 영상 등 스크래핑 불가 콘텐츠: 사용자가 직접 키워드 입력 후 저장
- 나중에 검색하면 AI가 가장 적합한 스크랩을 보여줌 (정확히 일치하는 항목 우선 + 임베딩 기반 유사 항목 추가 노출)
- 프론트는 WebView 기반으로 실제 UI를 렌더링하고, RN은 셸 + 공유 확장(Share Extension) 역할

## 기술 스택

- Expo SDK 57 (TypeScript 템플릿)
- 공유 기능: `expo-share-intent` (iOS Share Extension + Android Share Intent를 하나의 라이브러리로 처리)
- bare workflow 필요 (`expo-share-intent`는 네이티브 모듈이라 Expo Go 사용 불가 — dev client 빌드로만 테스트 가능)

## 프로젝트 구조

```
App.tsx                  # ShareIntentProvider로 감싼 엔트리포인트
src/screens/HomeScreen.tsx  # 공유받은 text/webUrl/meta.title을 표시하는 테스트 화면
app.json                 # scheme: "scrapapp" 설정 필수 (expo-share-intent 요구사항)
ios/, android/           # expo prebuild로 생성된 네이티브 프로젝트 (커밋 여부는 아직 미정 — 현재는 커밋됨)
```

## 로컬 개발 환경

- Mac + Xcode + Android Studio(에뮬레이터) 로컬 빌드로 진행 중 (EAS Build 클라우드 방식 아님)
- **Xcode 26.4 이상 필수** — Expo SDK 56/57은 이보다 낮은 버전에서 `expo-modules-jsi` 컴파일 실패함 (Swift 6.2 strict 규칙 충돌, [expo/expo#47539](https://github.com/expo/expo/issues/47539))
- Android: `$HOME/Library/Android/sdk` 에 SDK 설치됨, AVD `Medium_Phone_API_36.1` 사용 가능

## 자주 쓰는 명령어 (iOS)

### 시뮬레이터에 바로바로 변경사항 확인용 빌드 (Debug + Metro)

시뮬레이터가 이미 켜져 있는 상태에서:
```bash
npx expo run:ios
```
JS만 고쳤으면 재빌드 없이 Metro가 Fast Refresh 해줌. 이 명령어는 종료되지 않고 터미널에 로그를 계속 스트리밍하니, 로그 확인하려면 **직접 이 터미널에서** 실행해야 함(백그라운드로 돌리면 안 보임).

### 실기기(아이폰/아이패드)에 릴리즈로 시연용 빌드 (Metro/케이블/와이파이 없이 하루 종일 독립 실행)

```bash
npx expo run:ios --device "<기기 이름>" --configuration Release
```
- `--configuration Release`가 핵심 — JS 번들이 앱에 통째로 박혀서 설치 후 Metro 서버 없이 완전히 독립적으로 실행됨
- `<기기 이름>`은 `xcrun devicectl list devices`로 확인 (예: `이나영의 iPhone`, `iPad (247)`)
- 설치 끝나면(`Installing ... Complete 100%`) 케이블 뽑아도 됨
- 무료 Apple ID 인증서 7일 만료 → 만료되면 케이블 다시 연결해서 같은 명령어 재실행
- **Xcode GUI에서 Run(▶) 버튼으로 실행하면 기본값이 Debug라 이 옵션이 안 먹음** — 반드시 터미널 명령으로 Release 지정해야 함

### 새 기기(특히 아이패드) 최초 연결 시 트러블슈팅

- `xcrun devicectl list devices`에서 기기가 안 보이면: 케이블 연결 + 잠금 해제 + "이 컴퓨터를 신뢰하시겠습니까?" 신뢰
- `error: Developer Mode disabled`: 기기에서 설정 > 개인정보 보호 및 보안 > 개발자 모드 켜기 → 재시작 요구 팝업 뜨면 재시작 → 재시작 후 잠금 해제 시 뜨는 확인 알럿에서도 반드시 "켜기" 눌러야 최종 적용됨
- `CommandError: There was an error reading pair record for device`: 페어링 캐시가 깨진 상태. 아래 순서로 재시도:
  1. `xcrun devicectl manage unpair --device <CoreDevice UUID>`
  2. 기기에서 설정 > 일반 > 전송 또는 재설정 > 재설정 > **위치 및 개인정보 보호 재설정** (신뢰한 컴퓨터 목록 초기화, 앱 데이터는 안 지워짐)
  3. 케이블 재연결 → 신뢰 팝업 다시 뜨면 신뢰
  4. `xcrun devicectl manage pair --device <CoreDevice UUID>`
  5. 그래도 안 되면 Xcode GUI에서 직접 Run 시도 (CLI보다 페어링을 더 안정적으로 처리하는 경우가 있음) → 이후 터미널 명령으로 Release 재실행
- `Provisioning profile ... doesn't include the currently selected device`: Xcode에서 `open ios/*.xcworkspace` → TARGETS의 `2026UnithonScrapApp`, `ShareExtension` 각각 Signing & Capabilities 탭에서 자동 서명 확인/재시도(기기가 계정에 자동 등록됨)

### Android APK를 QR/링크로 배포 (부스 시연 등, EAS 클라우드 빌드)

```bash
npx eas build --profile preview --platform android --non-interactive
```
- `eas.json`의 `preview` 프로필은 `distribution: internal`, `buildType: apk`라 Metro 없이 완결되는 standalone 빌드
- 빌드 끝나면 터미널/빌드 페이지(`https://expo.dev/accounts/wwwlnyy/projects/unwork-archive/builds/...`)에 QR 코드 뜸 → 안드로이드 기기 카메라로 스캔해서 다운로드
- 로컬 `git push` 불필요 — EAS Build는 로컬 작업 디렉토리를 그대로 압축해서 업로드함 (커밋조차 필수 아님, 다만 관리 차원에서 커밋 후 빌드하는 습관 권장)
- 사이드로드 APK라 설치 시 Google Play Protect 경고 뜰 수 있음 → "무시하고 설치"

### 테스트 절차 — Android 에뮬레이터

1. 설치된 AVD 목록 확인 (최초 1회만 확인하면 됨)
   ```bash
   $HOME/Library/Android/sdk/emulator/emulator -list-avds
   ```
2. 에뮬레이터 부팅
   ```bash
   $HOME/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &
   ```
3. 부팅 완료까지 대기 (홈 화면 뜨는 것 확인, 또는 커맨드로 대기)
   ```bash
   adb wait-for-device
   until adb shell getprop sys.boot_completed 2>/dev/null | grep -q 1; do sleep 2; done
   ```
4. 빌드 + 설치 + Metro 실행 (한 번에 처리됨)
   ```bash
   npx expo run:android
   ```
   - 최초 빌드는 Gradle 때문에 오래 걸림(수 분~10분+), 이후엔 캐시로 빨라짐
   - 성공하면 Metro가 같이 뜨고 에뮬레이터에 앱이 자동 실행됨
5. JS 코드만 수정했다면 재빌드 없이 Metro가 자동으로 Fast Refresh 해줌. 네이티브 설정(`app.json`의 plugin 옵션 등)을 바꿨다면 3번부터 다시.

### 테스트 절차 — iOS 실기기

1. iPhone을 케이블로 Mac에 연결 (또는 이미 페어링된 상태면 Wi-Fi로도 가능)
2. iPhone 잠금 해제 후 "이 컴퓨터를 신뢰하시겠습니까?" 뜨면 신뢰 (최초 1회)
3. 연결된 기기 확인
   ```bash
   xcrun devicectl list devices
   ```
   → `이나영의 iPhone` 옆의 Identifier(UDID) 확인
4. (최초 1회만) Xcode에서 서명 팀 설정 — 이미 되어 있으면 생략
   ```bash
   open ios/*.xcworkspace
   ```
   좌측 TARGETS에서 `2026UnithonScrapApp`, `ShareExtension` **둘 다** Signing & Capabilities 탭 → Team 지정
5. 빌드 + 설치 + Metro 실행
   ```bash
   npx expo run:ios --device "<3번에서 확인한 UDID 또는 기기 이름>"
   ```
   - 최초 실행 시 iPhone에 "신뢰되지 않은 개발자" 팝업 뜨면: 설정 > 일반 > VPN 및 기기 관리 > 개발자 앱에서 본인 Apple ID 신뢰 → 앱 아이콘 다시 탭해서 실행
   - 무료 Apple ID 인증서는 7일마다 만료 → 만료되면 5번 명령 재실행
6. Xcode가 필요한 iOS 플랫폼 버전(예: iOS 26.5)을 아직 안 받았다는 에러가 뜨면: Xcode > Settings > Components 에서 해당 버전 다운로드 후 재시도 (8GB+, 시간 소요)

### Metro만 재시작하고 싶을 때

앱은 이미 설치돼 있고 Metro 연결만 끊겼을 때 (예: "No script url provided" 에러):
```bash
npx expo start --dev-client
```
포트 8081이 이미 사용 중이라고 뜨면 이전 Metro 프로세스가 살아있는 것 — 새로 안 띄워도 됨. 안 뜨면 `lsof -i :8081`로 기존 프로세스 확인 후 필요시 종료.

### 공유 기능 테스트 방법

1. 위 절차로 앱을 에뮬레이터/실기기에 설치 + 실행해둔 상태에서
2. Safari(iOS) 또는 Chrome(Android)에서 아무 페이지나 열고 공유 버튼 탭
3. 공유 시트에 "ScrapApp"이 보이는지 확인 → 선택
4. 앱이 열리면서 홈 화면에 받은 텍스트/URL/메타 제목이 표시되는지 확인

### iOS 서명 설정 (최초 1회, Xcode GUI에서)

`ios/*.xcworkspace` 열어서 **두 타겟 모두** Team 설정 필요:
- `2026UnithonScrapApp` (메인 앱)
- `ShareExtension`

무료 Apple ID 개인 계정으로 실기기 설치 가능 (단, 인증서가 7일마다 만료되어 재빌드 필요).

## 알려진 이슈 / 트러블슈팅

- **"No script url provided" 에러**: Metro 서버가 안 떠 있을 때 발생. `npx expo start --dev-client` 또는 `npx expo run:ios/android`로 Metro까지 같이 띄워야 함.
- **iOS 실기기 빌드 시 "iOS 26.x is not installed"**: Xcode > Settings > Components에서 해당 iOS 버전 플랫폼(시뮬레이터+기기 지원 통합 패키지, 8GB+) 다운로드 필요. Xcode 15+부터 기기 지원만 따로 받는 옵션 없음.
- **공유 후 "Refreshing" 반복 현상**: 앱이 Metro에 처음 연결될 때 1회성으로 발생하는 것으로 보임 (재현 불안정, 근본 원인 미확정 — 반복되면 디바이스 콘솔 로그로 재조사 필요).

## 현재 상태

- Android 에뮬레이터: 빌드/설치/실행 확인 완료
- iOS 실기기("이나영의 iPhone"): 빌드/설치/신뢰 설정 완료, Safari 공유 → 앱에서 텍스트/URL 수신 확인 완료
- 백엔드 연동, 검색 화면, 실제 스크랩 저장 로직은 아직 미구현 (현재는 공유 수신 테스트용 HomeScreen만 존재)
