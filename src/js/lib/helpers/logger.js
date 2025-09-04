const logger = require('loglevel');

function configureLogger(options) {
  logger.setLevel(options.level);

  return logger;
}

function rotateLogLevel() {
  const levels = ['info', 'debug', 'warn'];
  const levelMap = {
    0: 'debug', // 'trace' level mapped to 'debug'
    1: 'debug',
    2: 'info',
    3: 'warn',
    4: 'warn', // 'error' level mapped to 'warn'
    5: 'warn', // 'silent' level mapped to 'warn'
  };
  const currentLevel = levelMap[logger.getLevel()];
  const newLevel = levels[(levels.indexOf(currentLevel) + 1) % (levels.length)];
  logger.setLevel(newLevel);
  console.log(`Log level set to ${newLevel}`);
}

module.exports = {
  logger,
  configureLogger,
  rotateLogLevel,
};
