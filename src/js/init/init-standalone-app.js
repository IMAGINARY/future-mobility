const yaml = require('js-yaml');
const CfgReaderFetch = require('../cfg-loader/cfg-reader-fetch');
const CfgLoader = require('../cfg-loader/cfg-loader');
const { installFatalErrorHandler } = require('../lib/show-fatal-error');
const configFiles = require('./config-files');
const { configureLogger, logger } = require('../helpers/logger');

async function initStandaloneApp() {
  const qs = new URLSearchParams(window.location.search);
  installFatalErrorHandler();
  configureLogger({
    level: qs.get('loglevel') || 'info',
  });

  // Accept a settings url param but only if it's made of alphanumeric characters, _ or -, and
  // has a .yml extension.
  let settingsFilename = 'settings.yml';
  const settingsFileUnsafe = qs.get('settings');
  if (qs.get('settings')) {
    if (!qs.get('settings').match(/^[a-zA-Z0-9_-]+\.yml$/)) {
      logger.warn('Invalid settings file name. Ignoring. Use only alphanumeric characters, _ or -. and .yml extension.');
    } else {
      settingsFilename = settingsFileUnsafe;
    }
  }

  const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);

  let config;
  try {
    logger.debug('Loading configuration files: %s', configFiles.join(', '));
    logger.debug('Loading settings file: %s', settingsFilename);
    config = await cfgLoader.load([
      ...configFiles.map((name) => `config/${name}.yml`),
      settingsFilename,
    ]);
    logger.debug('Configuration loaded successfully', config);
  } catch (err) {
    throw new Error(`Error loading configuration: ${err.message}`);
  }

  return { config };
}

module.exports = {
  initStandaloneApp,
};
