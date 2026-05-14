# Aurora 패키지 매니저

외부 의존성 없이 설계된 **Aurora Austral** 언어용 고성능 독립형 패키지 매니저입니다.

## 설치

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**참고:** 이 패키지는 완전히 독립적입니다. Node.js 네이티브 API(`fetch`, `fs`, `path`, `os`, `child_process`)만 사용합니다.

## 주요 명령

- `aurora init`: 새 프로젝트를 초기화하고 로컬 컴파일러를 설정합니다.
- `aurora install <패키지>`: 공식 저장소에서 패키지를 다운로드하고 컴파일 및 테스트합니다.
- `aurora find <검색어>`: 이름 및 README.md 파일 내용 내에서 지능형 검색을 수행합니다.
- `aurora list`: 사용 가능하거나 로컬에 설치된 패키지를 나열합니다.
- `aurora update`: 프로젝트 의존성을 업데이트합니다.

## 표준 라이브러리 통합
매니저는 `aurora-austral-standard-lib`의 위치를 자동으로 감지하여 모든 패키지가 로컬 버전의 표준 라이브러리에 대해 올바르게 컴파일되도록 합니다.

## 라이선스
Apache-2.0
