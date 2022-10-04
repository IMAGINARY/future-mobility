# future-mobility

An exhibit about the Future of Mobility.

## Compilation

To install the required dependencies run `npm install` in **both** the root directory and the 
`server` directory.

You can use `npm run build` or `npm run watch` in the root directory to build the client apps. The 
server does not require compilation.

The `.env` file in the root directory contains settings that are applied at compilation time.

## Running

Start the server by running `npm run start` in the `server` directory.

The clients, in the root directory, are:

- `city.html`: Presents the city map, to be projected over the exhibition table.
- `dashboard.html`: Shows the auxiliary touchscreen dashboard that displays variables and goals,
    and allows selecting Power-Ups.
- `editor.html`: An editor that pushes changes to the server. Note that it doesn't read updates from
    the server, so it's not possible to use multiple editors simulatenously. It's only meant for 
    use during development.

## Configuration

The main configuration file is `config.yml`. The server has to be reloaded after any changes.
Clients get the configuration from the server through the http API and have to be reloaded after
the server to take any changes.

The .env file has other configuration keys that affect the environment.

## Server APIs

The server has both an HTTP and a WebSocket API. Their specifications are:

- http: `specs/openapi.yaml`
- ws: `specs/asyncapi.yaml`

You can use [Swagger Editor](https://editor.swagger.io/) and the 
[AsyncAPI Playground](https://playground.asyncapi.io/) to format the respective specifications in
a friendly format.

## License

Copyright (c) 2021 IMAGINARY gGmbH
Licensed under the MIT license (see LICENSE)
Supported by Futurium gGmbH

