# ChattyPay - Catty Wallet 😺

AI 기반 대화형 금융 관리 앱입니다. 5명의 독특한 캐릭터가 친근한 대화를 통해 사용자의 지출을 관리하도록 도와줍니다.

## 기능

- **지출 추적**: 일일 수입과 지출을 한눈에 확인
- **AI 채팅**: Catty와 대화하며 금융 습관 개선
- **분석**: 카테고리별 지출 분석 및 인사이트
- **프로필**: 개인 설정 및 계정 관리

## 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm start
```

브라우저에서 자동으로 `http://localhost:3000`이 열립니다.

## 기술 스택

- **React 18**: UI 프레임워크
- **Tailwind CSS**: 스타일링 (CDN)
- **Helvetica 폰트**: 전체 앱에 적용

## 디자인 특징

- ✨ 우아한 미니멀리즘과 기능적 디자인의 완벽한 균형
- 📱 아이폰 스타일 곡선 프레임 (375x812px)
- 🎨 부드러운 그라데이션 색상
- 🔄 섬세한 마이크로 인터랙션
- 🎯 핵심 기능에 자연스러운 집중

## 프로젝트 구조

```
chatty wallet/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── SpendingPage.js      # 지출 개요 페이지
│   │   ├── ChatPage.js          # AI 채팅 페이지
│   │   ├── AnalyticsPage.js     # 분석 페이지
│   │   ├── ProfilePage.js       # 프로필 페이지
│   │   ├── NavigationBar.js     # 하단 내비게이션
│   │   └── NavigationBar.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 라이선스

MIT License

