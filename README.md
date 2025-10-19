# [Python Front](https://github.com/europanite/python_front "Python Front")

[![CI](https://github.com/europanite/python_front/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/python_front/actions/workflows/ci.yml)
[![Frontend Tests via Docker](https://github.com/europanite/python_front/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/python_front/actions/workflows/docker.yml)
[![Deploy Expo Web to GitHub Pages](https://github.com/europanite/python_front/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/python_front/actions/workflows/deploy-pages.yml)

A browser based Python playground. 

!["web_ui"](./assets/images/web_ui.png)

##  Demo
 [Python Front](https://europanite.github.io/python_front/)

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