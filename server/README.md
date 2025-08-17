# future-mobility-server

Server for the future-mobility exhibit.

This server connects the scanner service with the multiple views and UIs that form part of the
exhibit.

## Options

- **Port** (default 4848): Set through the PORT env var or the `-p` / `--port` options.
- **Log level** (default 'info'): Set through the LOG_LEVEL env var or the `-l` / `--log-level` option.
  Valid options are 'debug', 'verbose', 'info', 'warn', and 'error'.
- **Output config** (default false): If true, prints the contents of the configuration before
    starting the server. Set through the OUTPUT_CONFIG env var or the `-o` / `--output-config` option.
- **Settings file** (default '../settings.yml'): Set through the SETTINGS_FILE env var or the `-s` / `--settings-file` options.
- **Sentry DSN** (default undefined): Set through the SENTRY_DSN env var or the `--sentry-dsn` option.

## License

Copyright (c) 2021 IMAGINARY gGmbH
Licensed under the MIT license (see LICENSE)

