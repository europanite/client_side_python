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

Um playground de Python baseado em navegador e executado no lado do cliente. 

---

## Visão geral

Client Side Python é um **playground de Python baseado em navegador, alimentado por Pyodide**.  
Todo o código Python é executado **inteiramente dentro da aba do navegador** (WebAssembly, sem backend), então seu código nunca sai da sua máquina.

Isso o torna útil para:

- Testar rapidamente pequenos trechos de código Python
- Demonstrar conceitos básicos de Python em sala de aula ou workshops
- Experimentar tarefas simples de cálculo numérico ou scripting em um sandbox seguro
- Mostrar como WebAssembly + Pyodide podem levar Python “de verdade” para o navegador

---

## Recursos

- **Execução totalmente no lado do cliente**  
  - Usa [Pyodide](https://pyodide.org) para executar CPython em WebAssembly.
  - Nenhum servidor, banco de dados ou autenticação é necessário por padrão.

- **Editor de código simples + console**  
  - Área de texto para código Python.
  - Área de console que mostra `stdout` e `stderr`.
  - Botões: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **Mecanismo de “Stop” suave**  
  - A execução é encapsulada com um token de cancelamento suave.
  - Quando você pressiona **Stop**, a execução atual é logicamente cancelada para que resultados tardios sejam ignorados em vez de quebrar a UI.

- **Interface web responsiva**  
  - Construída com **Expo / React Native Web** e componentes do **Material UI**.
  - O layout se adapta a diferentes tamanhos de viewport (desktop / tablet).

- **CI determinístico via Docker**  
  - Os testes com Jest são executados em um contêiner Docker usando `docker-compose.test.yml`.
  - Workflows do GitHub Actions são fornecidos para CI e testes baseados em Docker.

- **Deploy automático no GitHub Pages**  
  - Um workflow do GitHub Actions compila o bundle web do Expo e o publica no GitHub Pages para a branch `main`.

---

## Como funciona

Na primeira carga, o aplicativo:

1. Busca o Pyodide a partir de uma CDN.
2. Inicializa o runtime do Pyodide e expõe `runPythonAsync`.
3. Anexa handlers personalizados para `stdout` e `stderr`, para que a saída do Python seja transmitida para o console na página.
4. Usa um token de execução simples para implementar um **soft Stop**:
   - Cada execução incrementa um `execId` interno.
   - Se uma execução terminar com um `execId` desatualizado, sua saída será descartada.
   - Isso evita que resultados antigos contaminem o console.

Tudo isso acontece **no navegador**, sem nenhuma chamada a APIs de backend.

---

## 🚀 Primeiros passos

### 1. Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### 2. Compile e inicie todos os serviços:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. Teste:
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
