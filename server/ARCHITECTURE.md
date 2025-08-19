# future-mobility Server Architecture

This document describes the high level architecture of the future-mobility server. 
Inspired by [this article](https://matklad.github.io//2021/02/06/ARCHITECTURE.md.html).

## Project overview

## main.js

The main entry point for the server is `server/main.js`. It deals with the command line
arguments, loads the configuration, and starts the server.

## lib/app.js

It sets up the Express application, configures the routes, and initializes the WebSocket server.
This file is responsible for the "controller" part of the application. The parts of the model are:

- **city:** The map.
- **data manager:** It tracks variables, mapped variables and goals provided by data sources based on
  the state of the city map
- **power-ups:** The server tracks which ones are active. Active power-ups modify the state of the
  simulation through the data manager (by providing modifiers to different variables).

## lib/model-manager.js

This manages/centralizes the models (i.e. state) that are interfaced through the server's controller.

## lib/data-src-cfg.js

This file provides the model manager with the list of data sources to use. This works like a
"plug-in" system.
