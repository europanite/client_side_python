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


> **Note**
> This is a translated version of this README. The English version (`README.md`) is the source of truth.

!["web_ui"](./assets/images/web_ui.png)

 [PlayGround](https://europanite.github.io/client_side_python/)

Un playground de Python del lado del cliente y basado en el navegador. 

---

## Descripción general

Client Side Python es un **playground de Python basado en el navegador e impulsado por Pyodide**.  
Todo el código Python se ejecuta **por completo dentro de tu pestaña del navegador** (WebAssembly, sin backend), por lo que tu código nunca sale de tu máquina.

Esto lo hace útil para:

- Probar rápidamente pequeños fragmentos de código Python
- Demostrar conceptos básicos de Python en una clase o taller
- Experimentar con tareas numéricas o de scripting sencillas en un entorno aislado y seguro
- Mostrar cómo WebAssembly + Pyodide pueden llevar Python “real” al navegador

---

## Características

- **Ejecución totalmente del lado del cliente**  
  - Usa [Pyodide](https://pyodide.org) para ejecutar CPython en WebAssembly.
  - No requiere servidor, base de datos ni autenticación por defecto.

- **Editor de código simple + consola**  
  - Área de texto para código Python.
  - Área de consola que muestra `stdout` y `stderr`.
  - Botones: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **Mecanismo de “Stop” suave**  
  - La ejecución está envuelta en un token de cancelación suave.
  - Cuando pulsas **Stop**, la ejecución actual se cancela lógicamente para que los resultados tardíos se ignoren en lugar de romper la interfaz.

- **Interfaz web responsive**  
  - Construida con **Expo / React Native Web** y componentes de **Material UI**.
  - El diseño se adapta a distintos tamaños de viewport (escritorio / tablet).

- **CI determinista con Docker**  
  - Las pruebas de Jest se ejecutan dentro de un contenedor Docker usando `docker-compose.test.yml`.
  - Se incluyen workflows de GitHub Actions para CI y pruebas basadas en Docker.

- **Despliegue automático en GitHub Pages**  
  - Un workflow de GitHub Actions compila el bundle web de Expo y lo publica en GitHub Pages para la rama `main`.

---

## Cómo funciona

En la primera carga, la aplicación:

1. Obtiene Pyodide desde una CDN.
2. Inicializa el runtime de Pyodide y expone `runPythonAsync`.
3. Adjunta handlers personalizados para `stdout` y `stderr` para que la salida de Python se envíe en streaming a la consola integrada.
4. Usa un token de ejecución simple para implementar un **soft Stop**:
   - Cada ejecución incrementa un `execId` interno.
   - Si una ejecución finaliza con un `execId` desactualizado, su salida se descarta.
   - Esto evita que resultados obsoletos de ejecuciones anteriores contaminen la consola.

Todo esto sucede **en el navegador**, sin llamadas a ninguna API backend.

---

## 🚀 Primeros pasos

### 1. Requisitos previos
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

### 2. Compila e inicia todos los servicios:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. Pruebas:
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
