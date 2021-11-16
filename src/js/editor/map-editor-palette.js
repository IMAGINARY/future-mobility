const EventEmitter = require('events');

class MapEditorPalette {
  constructor($element, config) {
    this.$element = $element;
    this.config = config;
    this.activeButton = null;
    this.tileId = null;
    this.events = new EventEmitter();

    this.$element.addClass('map-editor-palette');

    this.buttons = Object.entries(config.tileTypes).map(([id, typeCfg]) => $('<button></button>')
      .attr({
        type: 'button',
        title: typeCfg.name,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-tile',
        `editor-palette-button-tile-${id}`,
      ])
      .css({
        backgroundColor: typeCfg.color,
        backgroundImage: `url(${typeCfg.editorIcon})`,
      })
      .on('click', (ev) => {
        if (this.activeButton) {
          this.activeButton.removeClass('active');
        }
        this.activeButton = $(ev.target);
        this.activeButton.addClass('active');
        this.tileId = Number(id);
        this.events.emit('change', 'tile', Number(id));
      }));

    this.buttons.push($('<div class="separator"></div>'));

    this.toolButtons = MapEditorPalette.Tools.map(tool => $('<button></button>')
      .attr({
        type: 'button',
        title: tool.title,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-tool',
        `editor-palette-button-tool-${tool.id}`,
      ])
      .css({
        backgroundImage: `url(${tool.icon})`,
      })
      .on('click', (ev) => {
        if (this.activeButton) {
          this.activeButton.removeClass('active');
        }
        this.activeButton = $(ev.target);
        this.activeButton.addClass('active');
        this.events.emit('change', tool.id);
      }));

    this.buttons.push(...this.toolButtons);

    this.buttons.push($('<div class="separator"></div>'));

    const actionButtons = MapEditorPalette.Actions.map(action => $('<button></button>')
      .attr({
        type: 'button',
        title: action.title,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-action',
        `editor-palette-button-action-${action.id}`,
      ])
      .css({
        backgroundImage: `url(${action.icon})`,
      })
      .on('click', () => {
        this.events.emit('action', action.id);
      }));

    this.buttons.push(...actionButtons);

    this.$element.append(this.buttons);
    if (this.buttons.length) {
      this.buttons[0].click();
    }
  }
}

MapEditorPalette.Actions = [
  {
    id: 'load',
    title: 'Load map',
    icon: 'static/fa/folder-open-solid.svg',
  },
  {
    id: 'save',
    title: 'Save map',
    icon: 'static/fa/save-solid.svg',
  },
  {
    id: 'import',
    title: 'Import map',
    icon: 'static/fa/file-import-solid.svg',
  },
  {
    id: 'export',
    title: 'Export map',
    icon: 'static/fa/file-export-solid.svg',
  },
];

MapEditorPalette.Tools = [
  {
    id: 'measureDistance',
    title: 'Measure distance',
    icon: 'static/fa/ruler-horizontal-solid.svg',
  },
  {
    id: 'showPollution',
    title: 'Show pollution',
    icon: 'static/fa/smog-solid.svg',
  },
  {
    id: 'showNoise',
    title: 'Show noise',
    icon: 'static/fa/drum-solid.svg',
  }
];

module.exports = MapEditorPalette;
