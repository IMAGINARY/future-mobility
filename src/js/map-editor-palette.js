import EventEmitter from 'events';

export default class MapEditorPalette {
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
      .addClass(['editor-palette-button', 'editor-palette-button-tile', `editor-palette-button-tile-${id}`])
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
        this.tileId = id;
        this.events.emit('change', id);
      }));

    this.$element.append(this.buttons);
    if (this.buttons.length) {
      this.buttons[0].click();
    }
  }
}
