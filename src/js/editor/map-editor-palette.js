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

    this.toolButtons = [
      $('<button></button>')
        .attr({type: 'button', title: 'Measure distance'})
        .addClass([
          'editor-palette-button',
          'editor-palette-button-tool',
          'editor-palette-button-tool-distance',
        ])
        .css({
          backgroundImage: 'url(\'static/fa/ruler-horizontal-solid.svg\')',
        })
        .on('click', (ev) => {
          if (this.activeButton) {
            this.activeButton.removeClass('active');
          }
          this.activeButton = $(ev.target);
          this.activeButton.addClass('active');
          this.tileId = null;
          this.events.emit('change', 'measureDistance');
          // this.events.emit('action', 'measureDistance',);
        }),
    ];

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

module.exports = MapEditorPalette;
