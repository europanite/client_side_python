# [Browser Based Python](https://github.com/europanite/browser_based_python "Browser Based Python")

[![CI](https://github.com/europanite/browser_based_python/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/browser_based_python/actions/workflows/ci.yml)
[![Frontend Tests via Docker](https://github.com/europanite/browser_based_python/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/browser_based_python/actions/workflows/docker.yml)
[![Deploy Expo Web to GitHub Pages](https://github.com/europanite/browser_based_python/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/browser_based_python/actions/workflows/deploy-pages.yml)

A Client Side Browser Based Python Playground. 

!["web_ui"](./assets/images/web_ui.png)

##  Demo
 [Browser Based Python](https://europanite.github.io/browser_based_python/)

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
---

# License
- Apache License 2.0