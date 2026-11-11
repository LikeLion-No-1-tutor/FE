# TeachingLog Frontend

AI 학생에게 직접 가르치며 학습 내용을 점검하는 **티칭로그(TeachingLog)** 서비스의 프론트엔드 프로젝트입니다.

React와 Vite를 기반으로 사용자 인터페이스를 구현하고, 학습 자료 제출부터 AI 학생과의 수업, 정리노트, 평가 및 성장보고서까지 이어지는 사용자 경험을 제공합니다.

## 🛠 Tech Stack

| 구분            | 기술                  |
| --------------- | --------------------- |
| Framework       | React                 |
| Language        | JavaScript (JSX)      |
| Build Tool      | Vite                  |
| Routing         | React Router          |
| Styling         | CSS                   |
| Design          | Figma                 |
| Version Control | Git, GitHub           |
| Deployment      | Vercel (배포 준비 중) |

## ✨ Implemented Features

### 1. 사용자 인증 및 초기 설정

- 온보딩 페이지
- 로그인 페이지 UI
- 닉네임 설정 및 변경
- 계정 설정 및 로그아웃 UI

### 2. 메인 페이지

- 사용자 닉네임 기반 환영 메시지
- 주요 학습 기능 바로가기
- 최근 수업 목록 표시
- 사이드바를 통한 페이지 이동

### 3. 학습 자료 제출

- 학습 자료 파일 선택 및 업로드 UI
- AI 학생 선택 인터페이스
- 파일 및 학생 선택 상태 관리
- 선택한 정보를 수업 화면으로 전달

### 4. AI 학생 가르치기

- 채팅 기반 수업 인터페이스
- 사용자 메시지 입력 및 표시
- AI 학생의 손들기 및 질문 UI
- 핵심 용어 체크리스트
- 수업 저장 및 종료 팝업

### 5. 정리노트

- 정리노트 목록 페이지
- 학습 주제 검색
- 분야별 필터 및 최신순 정렬
- 정리노트 상세 페이지
- 주요 개념 및 핵심 용어 표시

### 6. 학생 AI 평가

- AI 학생 프로필 표시
- 평가 진행 상태 및 진행률 UI
- 평가 완료 후 결과 페이지 이동

### 7. 성장보고서

- 성장보고서 목록 페이지
- 학습 주제 검색 및 분야별 필터
- 점수에 따른 배지 색상 구분
- 평가 결과 및 학습 피드백 표시
- 이전 평가 결과 비교 UI

### 8. 직접 재시험

- 객관식, 단답형, 서술형 문제 UI
- 문제별 답안 입력 및 상태 관리
- 시험 제출 확인 팝업
- 재시험 결과 페이지
- 정답 및 오답 표시

## 📁 Project Structure

```text
src/
├── assets/
│   ├── icons/
│   └── images/
│
├── components/
│   ├── common/
│   └── layout/
│
├── pages/
│   ├── onboarding-page/
│   ├── login-page/
│   ├── nickname-page/
│   ├── home-page/
│   ├── upload-page/
│   ├── teaching-page/
│   ├── note-list-page/
│   ├── note-page/
│   ├── assessment-page/
│   ├── growth-report-list-page/
│   ├── growth-report-page/
│   ├── retest-page/
│   ├── retest-result-page/
│   └── settings-page/
│
├── router/
│   └── AppRouter.jsx
│
└── styles/
    └── global.css
```

## 🚀 Getting Started

### Requirements

- Node.js
- npm

### Installation

프로젝트를 클론합니다.

```bash
git clone <repository-url>
```

프로젝트 폴더로 이동합니다.

```bash
cd FE
```

의존성을 설치합니다.

```bash
npm install
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 접속합니다.

```text
http://localhost:5173
```

### Build

프로덕션 빌드를 생성합니다.

```bash
npm run build
```

빌드 결과를 로컬에서 확인합니다.

```bash
npm run preview
```

## 🎨 UI/UX

- PC 웹 중심의 반응형 레이아웃
- Figma 기반 UI 구현
- 공통 컴포넌트를 활용한 디자인 일관성 유지
- 공통 색상 및 스타일 변수 관리
- SVG 아이콘 기반 인터페이스
- 학습 단계별 사용자 흐름을 고려한 화면 구성

## 🔄 Development Status

- [x] 주요 페이지 UI 구현
- [x] 공통 레이아웃 및 사이드바 구현
- [x] React Router 기반 페이지 이동
- [x] 검색 및 필터 UI 구현
- [x] 모달 및 사용자 인터랙션 구현
- [x] 데모 데이터를 활용한 화면 구성
- [ ] 백엔드 API 연동
- [ ] 실제 사용자 데이터 연동
- [ ] 통합 테스트
- [ ] 최종 배포

## 🌐 Deployment

**Platform:** Vercel

배포 완료 후 서비스 URL을 추가할 예정입니다.

---

**TeachingLog Frontend**
