import Modal from './modal';

export default class ModalImport extends Modal {
  constructor(validationFunction) {
    super({
      title: 'Import map',
    });

    this.$dataContainer = $('<textarea class="form-control"></textarea>')
      .attr({
        rows: 10,
        placeholder: 'Paste the JSON object here.',
      })
      .appendTo(this.$body);

    // noinspection JSUnusedGlobalSymbols
    this.$errorText = $('<p class="text-danger"></p>')
      .appendTo(this.$footer)
      .hide();

    // noinspection JSUnusedGlobalSymbols
    this.$copyButton = $('<button></button>')
      .addClass(['btn', 'btn-primary'])
      .text('Import')
      .on('click', () => {
        try {
          const imported = JSON.parse(this.$dataContainer.val());
          if (validationFunction(imported)) {
            this.hide(imported);
          } else {
            this.showError('Invalid format');
          }
        } catch (err) {
          this.showError(err.message);
        }
      })
      .appendTo(this.$footer);
  }

  showError(errorText) {
    this.$errorText.html(errorText);
    this.$errorText.show();
  }
}
