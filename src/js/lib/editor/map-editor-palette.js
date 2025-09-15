class MapEditorPalette {
  constructor(config, mapEditorController) {
    this.config = config;
    this.mapEditorController = mapEditorController;

    this.activeButton = null;
    this.$element = $('<div></div>')
      .addClass('map-editor-palette');

    const { tileTypes } = this.config;
    const toolButtonDefs = this.config.mapEditor.palette.toolButtons;
    const actionButtonDefs = this.config.mapEditor.palette.actionButtons;

    this.tileButtons = [];
    this.tileButtonsById = {};

    this.createTileButtons(tileTypes);
    this.toolButtons = this.createToolButtons(toolButtonDefs);
    this.actionButtons = this.createActionButtons(actionButtonDefs);

    this.$element.append([
      ...this.tileButtons,
      '<div class="separator"></div>',
      ...this.toolButtons,
      '<div class="separator"></div>',
      ...this.actionButtons,
    ]);

    this.mapEditorController.events.on('toolAdded', () => {
      this.updateButtonState();
    });
    this.mapEditorController.events.on('actionAdded', () => {
      this.updateButtonState();
    });
    this.updateButtonState();

    if (this.tileButtons.length) {
      this.tileButtons[0].click();
    }
  }

  createTileButtons(tileTypes) {
    Object.entries(tileTypes)
      .sort((a, b) => (a[1]?.editorOrder ?? a[0]) - (b[1]?.editorOrder ?? b[0]))
      .forEach(([id, typeCfg]) => {
        const button = $('<button></button>')
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
            this.mapEditorController.activateTool('tile', { tileType: Number(id) });
          });
        this.tileButtons.push(button);
        this.tileButtonsById[id] = button;
      });
  }

  createToolButtons(toolButtonDefs) {
    return toolButtonDefs.map((buttonDef) => $('<button></button>')
      .attr({
        type: 'button',
        title: buttonDef.title,
      })
      .data('tool-id', buttonDef.tool || buttonDef.id)
      .addClass([
        'editor-palette-button',
        'editor-palette-button-tool',
        `editor-palette-button-tool-${buttonDef.id}`,
      ])
      .css({
        backgroundImage: `url(${buttonDef.icon})`,
      })
      .prop('disabled', true)
      .on('click', (ev) => {
        if (this.activeButton) {
          this.activeButton.removeClass('active');
        }
        this.activeButton = $(ev.target);
        this.activeButton.addClass('active');
        this.mapEditorController.activateTool(
          buttonDef.tool || buttonDef.id,
          buttonDef.props || null
        );
      }));
  }

  createActionButtons(actionButtonDefs) {
    return actionButtonDefs.map((buttonDef) => $('<button></button>')
      .attr({
        type: 'button',
        title: buttonDef.title,
      })
      .data('action-id', buttonDef.id)
      .addClass([
        'editor-palette-button',
        'editor-palette-button-action',
        `editor-palette-button-action-${buttonDef.id}`,
      ])
      .css({
        backgroundImage: `url(${buttonDef.icon})`,
      })
      .on('click', () => {
        this.mapEditorController.runAction(buttonDef.id);
      }));
  }

  updateButtonState() {
    this.toolButtons.forEach(($button) => {
      $button.prop('disabled', !this.mapEditorController.hasTool($button.data('tool-id')));
    });
    this.actionButtons.forEach(($button) => {
      $button.prop('disabled', !this.mapEditorController.hasAction($button.data('action-id')));
    });
  }

  getKeyboardShortcuts() {
    // Return a mapping of keyboard keys to tool IDs for quick access
    const shortcuts = {};
    // Each tile button gets a number key (1-9), in order of apparition
    this.tileButtons.forEach(($button, index) => {
      if (index < 9) {
        shortcuts[(index + 1).toString()] = () => {
          $button.click();
        };
      }
    });

    return shortcuts;
  }
}

module.exports = MapEditorPalette;
