function showFatalError(text, error) {
  $('<div></div>')
    .addClass('fatal-error')
    .append($('<div></div>')
      .addClass('fatal-error-text')
      .html(text))
    .append($('<div></div>')
      .addClass('fatal-error-details')
      .html(error.message))
    .appendTo('body');

  $('html').addClass('with-fatal-error');
}

function installFatalErrorHandler() {
  const handleErrorEvent = (event) => {
    if (event.error) {
      showFatalError('Fatal error', event.error);
    } else if (event.reason) {
      showFatalError('Fatal error', new Error(event.reason));
    } else {
      showFatalError('Fatal error', new Error(event.message));
    }
  };

  window.addEventListener('error', handleErrorEvent);
  window.addEventListener('unhandledrejection', handleErrorEvent);
}

module.exports = { showFatalError, installFatalErrorHandler };
