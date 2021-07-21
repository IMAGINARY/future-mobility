class ConnectionStateView {
  constructor(connector) {
    this.$element = $('<div></div>')
      .addClass('connection-state-view');

    this.$errorMessage = $('<div></div>')
      .addClass('connection-state-view-error text-danger')
      .appendTo(this.$element);
    this.$errorStatus = $('<div></div>')
      .addClass('connection-state-view-status')
      .appendTo(this.$element);

    connector.events.on('disconnect', this.handleDisconnect.bind(this));
    connector.events.on('connectWait', this.handleConnectWait.bind(this));
    connector.events.on('connecting', this.handleConnecting.bind(this));
    connector.events.on('connect', this.handleConnect.bind(this));
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }

  setErrorMessage(message) {
    this.$errorMessage.html(message);
  }

  setErrorStatus(status) {
    this.$errorStatus.html(status);
  }

  handleDisconnect() {
    this.setErrorMessage('Disconnected from server');
    this.setErrorStatus('');
    this.show();
  }

  handleConnectWait() {
    this.setErrorStatus('Waiting to reconnect...');
  }

  handleConnecting() {
    this.setErrorStatus('Connecting...');
  }

  handleConnect() {
    this.hide();
  }
}

module.exports = ConnectionStateView;
