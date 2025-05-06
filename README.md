# Simple Post-it Chrome Extension

웹 페이지에 포스트잇을 붙이고 관리할 수 있는 크롬 확장 프로그램입니다.

## 주요 기능

### 💡 간편한 포스트잇 생성
- 드래그 앤 드롭으로 웹 페이지 어디든 포스트잇 생성
- 포스트잇 내용 작성 및 수정

### 📝 포스트잇 관리
- 현재 페이지의 포스트잇 목록 확인
- 포스트잇 내용 업데이트
- 포스트잇 삭제
- 도메인과 경로별 전체 포스트잇 조회

### 🔄 실시간 동기화
- 사이드바와 웹페이지 간 자동 동기화
- 브라우저 세션 간 상태 유지
- 실시간 개수 및 목록 업데이트

### 🎯 네비게이션
- 저장된 포스트잇 클릭으로 해당 페이지 이동
- 도메인과 경로별 포스트잇 정리
- 저장된 모든 위치에 빠르게 접근

## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/simple-post-it.git
```

2. 의존성 설치
```bash
npm install
```

3. 확장 프로그램 빌드
```bash
npm run build
```

4. 크롬에 확장 프로그램 로드
   - 크롬에서 `chrome://extensions/` 접속
   - "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - 프로젝트의 `dist` 디렉토리 선택

## 사용 방법

1. 확장 프로그램 아이콘 클릭하여 사이드바 열기
2. 포스트잇 생성:
   - 텍스트 영역에 메모 입력
   - "붙이기" 버튼을 원하는 위치로 드래그
3. 포스트잇 수정:
   - 포스트잇 클릭하여 내용 불러오기
   - 텍스트 수정
   - "업데이트" 클릭하여 저장
4. 포스트잇 삭제:
   - 포스트잇의 빨간색 X 버튼 클릭
   - 또는 사이드바 목록에서 삭제

## 개발 정보

- React와 TypeScript 기반
- Chrome Extension APIs 사용
- Tailwind CSS로 스타일링

### 프로젝트 구조
```
simple-post-it/
├── src/
│   ├── scripts/
│   │   ├── contentScript.ts    # 웹페이지 통합 스크립트
│   │   └── create-postit.ts    # 포스트잇 생성 로직
│   ├── sidepanel/
│   │   ├── sidepanel.tsx       # 메인 사이드바 컴포넌트
│   │   ├── post-it-list.tsx    # 현재 페이지 포스트잇 목록
│   │   └── domain-post-it-list.tsx # 전체 도메인 포스트잇 목록
│   ├── util/
│   │   └── storage.ts          # 크롬 스토리지 유틸리티
│   └── types/
│       └── post-it.ts          # TypeScript 인터페이스
└── manifest.json
```

## 기여하기

Pull Request는 언제나 환영합니다. 큰 변경사항의 경우, 먼저 이슈를 열어 논의해주세요.

## 라이선스

[MIT](https://choosealicense.com/licenses/mit/)