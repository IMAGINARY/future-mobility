# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**future-mobility** is an interactive web-based exhibit about the Future of Mobility. It consists of a central Express/WebSocket server that holds simulation state for a virtual city, with multiple client SPAs (city display, dashboard, editor) that connect and render the city state. A separate computer vision component (external repo) reads a physical city layout and pushes changes to the server.

Key design: The same model classes (`City`, `Grid`, etc.) run in both server and browser, enabling shared business logic.

## Commands

### Client Apps (root directory)
```bash
npm install              # Install client dependencies
npm run build            # Build all client apps with Webpack
npm run watch            # Watch mode for development
npm run lint             # ESLint check
npm run lint:style       # Stylelint check
```

### Server (server/ directory)
```bash
cd server
npm install              # Install server dependencies
npm start                # Start server (default port 4848)
npm test                 # Run Jest tests
```

### Running the Full Stack
1. `npm install` in both root and `server/` directories
2. `npm run build` in root (or `npm run watch` for development)
3. `cd server && npm start`
4. Open `http://localhost:4848/city.html` for city display, `/dashboard.html` for dashboard, `/editor.html` for map editor

## Architecture

### Entry Points
- `src/js/main.js` - Standalone demo (runs without server, for GitHub Pages)
- `src/js/main-city.js` - City display client
- `src/js/main-dashboard.js` - Dashboard touchscreen UI
- `src/js/main-editor.js` - Map editor for development

### Core Model (`src/js/lib/model/`)
- **City** - Grid-based city state, emits events on updates
- **DataManager** - Calculates variables and goals from city state
- **PowerUpManager** - Tracks active power-ups that modify simulation

### Server (`server/`)
- **main.js** - CLI handling, config loading, server startup
- **lib/app.js** - Express routes, WebSocket setup, controller logic
- **lib/model-manager.js** - Centralized state management
- **lib/data-src-cfg.js** - Data source plugin configuration

### Views (`src/js/lib/`)
- **view-pixi/** - PIXI.js GPU-accelerated rendering (MapView, VariableMapView)
- **view-html/** - DOM-based UI components
- **dashboard/** - Dashboard-specific UI components

### Key Patterns
- **Plugin architecture**: Tile renderers and map extensions are injected via `inject-*.js` functions
- **Configuration-driven**: YAML files in `/config` define tiles, variables, power-ups, dashboard layout
- **Event-driven updates**: City and managers emit events; views react to state changes
- **ServerSocketConnector**: Handles WebSocket sync between server and clients

## Configuration

### Environment Variables (.env)
```
SERVER_HTTP_URI=http://localhost:4848
SERVER_SOCKET_URI=ws://localhost:4848
```

### Client Query Parameters
- `?loglevel=debug|info|warn` - Set logging level
- `?test=scenarioName` - Load test scenario from `src/js/lib/test/scenarios.js`
- `?debug-orientations=true` - Show tile orientation overlay

### Server CLI Options
```
-p, --port <port>           # Server port (default 4848)
-l, --log-level <level>     # Log level (default info)
-s, --settings-file <path>  # Settings override file (default ../settings.yml)
```

## Conventions

- Classes stored in kebab-case files (e.g., `MapView` class → `map-view.js`)
- Entry points follow `main-*.js` pattern
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`
- Pure JavaScript (no TypeScript), ESLint with Airbnb config
- Node.js >= 24.4.1 required
