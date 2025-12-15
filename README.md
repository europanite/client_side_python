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

!["web_ui"](./assets/images/web_ui.png)

 [PlayGround](https://europanite.github.io/client_side_python/)

A Client-Side Browser-Based Python Playground. 

---

## Overview

Client Side Python is a **browser-based Python playground powered by Pyodide**.  
All Python code runs **entirely inside your browser tab** (WebAssembly, no backend), so your code never leaves your machine.

This makes it useful for:

- Quickly trying out small Python snippets
- Demonstrating Python basics in a classroom or workshop
- Experimenting with simple numeric or scripting tasks in a safe sandbox
- Showing how WebAssembly + Pyodide can bring “real” Python to the browser

---

## Features

- **Fully client-side execution**  
  - Uses [Pyodide](https://pyodide.org) to run CPython in WebAssembly.
  - No server, no database, no authentication required by default.

- **Simple code editor + console**  
  - Text area for Python code.
  - Console area that shows `stdout` and `stderr`.
  - Buttons: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **Soft “Stop” mechanism**  
  - Execution is wrapped with a soft cancel token.
  - When you press **Stop**, the current run is logically cancelled so that late results are ignored instead of breaking the UI.

- **Responsive web UI**  
  - Built with **Expo / React Native Web** and **Material UI** components.
  - Layout adapts to different viewport sizes (desktop / tablet).

- **Deterministic CI via Docker**  
  - Jest tests run in a Docker container using `docker-compose.test.yml`.
  - GitHub Actions workflows are provided for CI and Docker-based testing.

- **Automatic deployment to GitHub Pages**  
  - GitHub Actions workflow builds the Expo web bundle and publishes it to GitHub Pages for the `main` branch.

---

## How It Works

On first load, the app:

1. Fetches Pyodide from a CDN.
2. Initializes the Pyodide runtime and exposes `runPythonAsync`.
3. Attaches custom handlers for `stdout` and `stderr` so that Python output is streamed into the in-page console.
4. Uses a simple execution token to implement a **soft Stop**:
   - Each run increments an internal `execId`.
   - If a run finishes with an outdated `execId`, its output is discarded.
   - This prevents stale results from older runs from polluting the console.

All of this happens **in the browser**, without any backend API calls.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 2. Build and start all services:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. Test:
```bash
docker compose \
-f docker-compose.test.yml up \
--build --exit-code-from \
frontend_test 
```

---

# License
- Apache License 2.0