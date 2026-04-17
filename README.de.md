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

Ein browserbasiertes Python-Playground, das vollständig clientseitig läuft. 

---

## Überblick

Client Side Python ist ein **browserbasiertes Python-Playground auf Basis von Pyodide**.  
Der gesamte Python-Code wird **vollständig innerhalb deines Browser-Tabs ausgeführt** (WebAssembly, kein Backend), sodass dein Code deine Maschine nie verlässt.

Dadurch eignet es sich gut für:

- Das schnelle Ausprobieren kleiner Python-Snippets
- Das Vorführen von Python-Grundlagen im Unterricht oder in Workshops
- Das Experimentieren mit einfachen numerischen oder Skript-Aufgaben in einer sicheren Sandbox
- Das Zeigen, wie WebAssembly + Pyodide „echtes“ Python in den Browser bringen können

---

## Funktionen

- **Vollständig clientseitige Ausführung**  
  - Verwendet [Pyodide](https://pyodide.org), um CPython in WebAssembly auszuführen.
  - Standardmäßig sind weder Server, Datenbank noch Authentifizierung erforderlich.

- **Einfacher Code-Editor + Konsole**  
  - Textbereich für Python-Code.
  - Konsolenbereich, der `stdout` und `stderr` anzeigt.
  - Schaltflächen: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **Sanfter „Stop“-Mechanismus**  
  - Die Ausführung ist mit einem Soft-Cancel-Token umhüllt.
  - Wenn du **Stop** drückst, wird der aktuelle Lauf logisch abgebrochen, sodass verspätete Ergebnisse ignoriert werden, anstatt die UI zu beschädigen.

- **Responsives Web-UI**  
  - Erstellt mit **Expo / React Native Web** und **Material UI**-Komponenten.
  - Das Layout passt sich an unterschiedliche Viewport-Größen an (Desktop / Tablet).

- **Deterministische CI über Docker**  
  - Jest-Tests laufen in einem Docker-Container mit `docker-compose.test.yml`.
  - GitHub-Actions-Workflows für CI und Docker-basierte Tests sind enthalten.

- **Automatische Bereitstellung auf GitHub Pages**  
  - Ein GitHub-Actions-Workflow baut das Expo-Web-Bundle und veröffentlicht es für den Branch `main` auf GitHub Pages.

---

## Funktionsweise

Beim ersten Laden der App passiert Folgendes:

1. Pyodide wird von einem CDN geladen.
2. Die Pyodide-Laufzeit wird initialisiert und `runPythonAsync` wird verfügbar gemacht.
3. Benutzerdefinierte Handler für `stdout` und `stderr` werden angebunden, damit Python-Ausgaben in die Konsole auf der Seite gestreamt werden.
4. Ein einfaches Ausführungs-Token wird verwendet, um einen **soft Stop** zu implementieren:
   - Jeder Lauf erhöht eine interne `execId`.
   - Wenn ein Lauf mit einer veralteten `execId` endet, wird seine Ausgabe verworfen.
   - Dadurch wird verhindert, dass veraltete Ergebnisse älterer Läufe die Konsole verschmutzen.

All das geschieht **im Browser**, ganz ohne Backend-API-Aufrufe.

---

## 🚀 Erste Schritte

### 1. Voraussetzungen
- [Docker](https://www.docker.com/) und [Docker Compose](https://docs.docker.com/compose/)

### 2. Alle Services bauen und starten:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. Testen:
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
