class MapEditorPalette {
  constructor(config, mapEditor) {
    this.config = config;
    this.mapEditor = mapEditor;

    this.activeButton = null;
    this.$element = $('<div></div>')
      .addClass('map-editor-palette');

    const { tileTypes } = this.config;
    const { actions, tools } = this.config.mapEditor.palette;

    this.tileButtons = this.createTileButtons(tileTypes);
    this.toolButtons = this.createToolButtons(tools);
    this.actionButtons = this.createActionButtons(actions);

    this.$element.append([
      ...this.tileButtons,
      '<div class="separator"></div>',
      ...this.toolButtons,
      '<div class="separator"></div>',
      ...this.actionButtons,
    ]);

    if (this.tileButtons.length) {
      this.tileButtons[0].click();
    }
  }

  createTileButtons(tileTypes) {
    return Object.entries(tileTypes).map(([id, typeCfg]) => $('<button></button>')
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
        this.mapEditor.activateTool('tile', Number(id));
      }));
  }

  createToolButtons(tools) {
    return tools.map((tool) => $('<button></button>')
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
        this.mapEditor.activateTool(tool.id);
      }));
  }

  createActionButtons(actions) {
    return actions.map((action) => $('<button></button>')
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
        this.mapEditor.runAction(action.id);
      }));
  }
}

module.exports = MapEditorPalette;
