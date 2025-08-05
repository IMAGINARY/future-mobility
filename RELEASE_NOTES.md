# RELEASE NOTES

## v1.0.0 

### Breaking Changes

The `1.x.x` branch is not backwards compatible with `0.x.x`.

#### Required Node.js Version

The minimum required Node.js version is now `24.4.1`. It's possible that the exhibit will work with 
earlier versions.

#### Moved compiled files to `/dist`

Previously, compiled files were located in the root directory and tracked in the repository. 
Compilation output now goes in the `/dist` directory, which is not included in the repository. 

In case there's some issue that prevents compilation, you can still find compiled files for every
version in GitHub releases.

#### Changes to the Websocket API

The `view_show_map_var` message was replaced by `request_map_var_display` and `display_map_var`.

#### Updated dependencies

Pixi was upgraded to v7, Bootstrap to v5, chart.js to v4, and other dependencies were updated to 
their latest versions.
