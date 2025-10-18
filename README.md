# [Python Front](https://github.com/europanite/python_front "Python Front")

!["web_ui"](./assets/images/web_ui.png)

**full-stack development environment** using:

- **Frontend**: [Expo](https://expo.dev/) ([React Native](https://reactnative.dev/) + [TypeScript](https://www.typescriptlang.org/))  
  - Runs on **Web, Android, and iOS** with a single codebase
- **Container**: [Docker Compose](https://docs.docker.com/compose/) for consistent development setup

---

## Features

- 
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

### 3. Visit the services:

---
### 4. Test:

```bash
docker compose \
  -f docker-compose.test.yml run \
  --rm \
  --entrypoint /bin/sh service_test \
  -lc ' pytest -q '
```

---

# License
- Apache License 2.0