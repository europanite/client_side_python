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

Un playground Python côté client, accessible directement dans le navigateur. 

---

## Vue d’ensemble

Client Side Python est un **playground Python basé sur le navigateur et propulsé par Pyodide**.  
Tout le code Python s’exécute **entièrement dans votre onglet de navigateur** (WebAssembly, sans backend), donc votre code ne quitte jamais votre machine.

Cela le rend utile pour :

- Tester rapidement de petits extraits de code Python
- Présenter les bases de Python en classe ou en atelier
- Expérimenter des tâches numériques simples ou du scripting dans un sandbox sécurisé
- Montrer comment WebAssembly + Pyodide peuvent apporter du Python “réel” dans le navigateur

---

## Fonctionnalités

- **Exécution entièrement côté client**  
  - Utilise [Pyodide](https://pyodide.org) pour exécuter CPython dans WebAssembly.
  - Aucun serveur, aucune base de données et aucune authentification ne sont requis par défaut.

- **Éditeur de code simple + console**  
  - Zone de texte pour le code Python.
  - Zone de console affichant `stdout` et `stderr`.
  - Boutons : **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**.

- **Mécanisme de “Stop” souple**  
  - L’exécution est encapsulée dans un token d’annulation souple.
  - Lorsque vous appuyez sur **Stop**, l’exécution en cours est annulée de façon logique, de sorte que les résultats tardifs soient ignorés au lieu de casser l’interface.

- **Interface web responsive**  
  - Construite avec **Expo / React Native Web** et des composants **Material UI**.
  - La mise en page s’adapte à différentes tailles de viewport (desktop / tablette).

- **CI déterministe via Docker**  
  - Les tests Jest s’exécutent dans un conteneur Docker à l’aide de `docker-compose.test.yml`.
  - Des workflows GitHub Actions sont fournis pour la CI et les tests basés sur Docker.

- **Déploiement automatique vers GitHub Pages**  
  - Un workflow GitHub Actions construit le bundle web Expo et le publie sur GitHub Pages pour la branche `main`.

---

## Fonctionnement

Lors du premier chargement, l’application :

1. Récupère Pyodide depuis un CDN.
2. Initialise le runtime Pyodide et expose `runPythonAsync`.
3. Attache des gestionnaires personnalisés pour `stdout` et `stderr` afin que la sortie Python soit diffusée dans la console intégrée à la page.
4. Utilise un jeton d’exécution simple pour implémenter un **soft Stop** :
   - Chaque exécution incrémente un `execId` interne.
   - Si une exécution se termine avec un `execId` obsolète, sa sortie est ignorée.
   - Cela empêche les résultats périmés d’anciennes exécutions de polluer la console.

Tout cela se passe **dans le navigateur**, sans aucun appel à une API backend.

---

## 🚀 Bien démarrer

### 1. Prérequis
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/)

### 2. Construire et démarrer tous les services :

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. Tester :
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
