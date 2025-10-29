# [Client Side Python](https://github.com/europanite/client_side_python "Client Side Python")

[![CI](https://github.com/europanite/client_side_python/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/ci.yml)
[![Frontend Tests via Docker](https://github.com/europanite/client_side_python/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/docker.yml)
[![Deploy Expo Web to GitHub Pages](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml)

A Client-Side Browser-Based Python Playground. 

!["web_ui"](./assets/images/web_ui.png)

##  🚀 PlayGround

 [Client Side Python](https://europanite.github.io/client_side_python/)

---

## 🧰 How It Works

On first load, the app fetches Pyodide from CDN and exposes runPythonAsync to execute the code in the textbox. Output and errors are streamed to the in-page console. A soft “Stop” cancels by bumping an execution token. 

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
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test
```

---

# License
- Apache License 2.0