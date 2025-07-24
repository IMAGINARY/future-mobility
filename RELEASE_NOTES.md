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
