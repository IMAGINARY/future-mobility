import EventEmitter from 'events';

const PING_TIME = 30 * 1000;

export default class ServerSocketConnector {
  constructor(uri) {
    this.ws = new WebSocket(uri);
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);

    this.events = new EventEmitter();
    this.pingTimeout = null;
  }

  handleOpen() {
    this.events.emit('connect');
  }

  handleClose() {

  }

  handleMessage(ev) {
    const message = JSON.parse(ev.data);
    if (message.type === 'map_update') {
      this.events.emit('map_update', message.cells);
    }
  }

  handleError() {

  }

  send(data) {
    clearTimeout(this.pingTimeout);
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
    this.pingTimeout = setTimeout(() => { this.ping(); }, PING_TIME);
  }

  ping() {
    this.send('ping');
  }

  getMap() {
    this.send('get_map');
  }

  setMap(cells) {
    this.send({
      type: 'set_map',
      cells,
    });
  }
}
