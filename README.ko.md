# [Client Side Python](https://github.com/europanite/client_side_python "Client Side Python")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![CI](https://github.com/europanite/client_side_python/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/ci.yml)
[![Frontend Tests via Docker](https://github.com/europanite/client_side_python/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/docker.yml)
[![Deploy Expo Web to GitHub Pages](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml)

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

<p align="right">
  <a href="./README.md">🇺🇸 English</a> |
  <a href="./README.ja.md">🇯🇵 日本語</a> |
  <a href="./README.zh-CN.md">🇨🇳 简体中文</a> |
  <a href="./README.es.md">🇪🇸 Español</a> |
  <a href="./README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="./README.ko.md">🇰🇷 한국어</a> |
  <a href="./README.de.md">🇩🇪 Deutsch</a> |
  <a href="./README.fr.md">🇫🇷 Français</a>
</p>

!["web_ui"](./assets/images/web_ui.png)

 [PlayGround](https://europanite.github.io/client_side_python/)

브라우저에서 실행되는 클라이언트 사이드 기반 Python 플레이그라운드. 

---

## 개요

Client Side Python은 **Pyodide로 구동되는 브라우저 기반 Python 플레이그라운드**이다.  
모든 Python 코드는 **브라우저 탭 내부에서 완전히 실행되며**(WebAssembly, 백엔드 없음), 따라서 코드가 사용자의 컴퓨터 밖으로 나가지 않는다.

이 도구는 다음과 같은 용도에 적합하다.

- 작은 Python 스니펫을 빠르게 시험해 보기
- 수업이나 워크숍에서 Python 기초를 시연하기
- 안전한 샌드박스에서 간단한 수치 계산이나 스크립트 작업을 실험하기
- WebAssembly + Pyodide가 브라우저에 “진짜” Python을 어떻게 가져올 수 있는지 보여주기

---

## 기능

- **완전한 클라이언트 사이드 실행**  
  - [Pyodide](https://pyodide.org)를 사용해 WebAssembly에서 CPython을 실행한다.
  - 기본적으로 서버, 데이터베이스, 인증이 필요 없다.

- **간단한 코드 에디터 + 콘솔**  
  - Python 코드를 위한 텍스트 영역.
  - `stdout` 및 `stderr`를 표시하는 콘솔 영역.
  - 버튼: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **부드러운 “Stop” 메커니즘**  
  - 실행은 소프트 취소 토큰으로 감싸져 있다.
  - **Stop**을 누르면 현재 실행이 논리적으로 취소되며, 늦게 도착한 결과는 UI를 망가뜨리는 대신 무시된다.

- **반응형 웹 UI**  
  - **Expo / React Native Web**과 **Material UI** 컴포넌트로 구축되었다.
  - 레이아웃은 다양한 뷰포트 크기(데스크톱 / 태블릿)에 맞게 조정된다.

- **Docker를 통한 결정적 CI**  
  - Jest 테스트는 `docker-compose.test.yml`을 사용해 Docker 컨테이너에서 실행된다.
  - CI 및 Docker 기반 테스트를 위한 GitHub Actions 워크플로가 제공된다.

- **GitHub Pages로 자동 배포**  
  - GitHub Actions 워크플로가 Expo 웹 번들을 빌드하고 `main` 브랜치용 GitHub Pages에 게시한다.

---

## 동작 방식

앱이 처음 로드되면 다음 작업을 수행한다.

1. CDN에서 Pyodide를 가져온다.
2. Pyodide 런타임을 초기화하고 `runPythonAsync`를 노출한다.
3. Python 출력이 페이지 내 콘솔로 스트리밍되도록 `stdout` 및 `stderr`용 커스텀 핸들러를 연결한다.
4. 간단한 실행 토큰을 사용해 **soft Stop**을 구현한다.
   - 각 실행마다 내부 `execId`가 증가한다.
   - 오래된 `execId`를 가진 실행이 끝나면 해당 출력은 버려진다.
   - 이를 통해 이전 실행의 오래된 결과가 콘솔을 오염시키는 것을 막는다.

이 모든 과정은 **브라우저 내부**에서 이루어지며, 백엔드 API 호출은 전혀 필요하지 않다.

---

## 🚀 시작하기

### 1. 사전 요구 사항
- [Docker](https://www.docker.com/) 및 [Docker Compose](https://docs.docker.com/compose/)

### 2. 모든 서비스를 빌드하고 시작하기:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. 테스트:
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
