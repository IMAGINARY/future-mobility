const DataInspectorView = require('./data-inspector-view');

class DataInspectorComponent {
  constructor(stats, variables) {
    this.stats = stats;
    this.variables = variables;

    this.$element = $('<div></div>')
      .addClass('data-inspector-component');

    this.view = new DataInspectorView();
    this.$element.append(this.view.$element);

    this.$varSelector = $('<select></select>')
      .addClass(['form-control', 'form-control-sm', 'd-block'])
      .append(Object.entries(this.variables).map(([key, name]) => (
        $('<option></option>').text(name).attr('value', key)
      )));

    $('<div></div>').addClass(['row', 'mt-2'])
      .append($('<div></div>').addClass('col-8').append(this.$varSelector))
      .append($('<div></div>').addClass('col-4 d-grid gap-2').append(
        $('<button></button>')
          .attr('type', 'button')
          .addClass(['btn', 'btn-primary', 'btn-sm'])
          .text('Calculate')
          .on('click', () => {
            this.handleCalculate();
          })
      ))
      .appendTo(this.$element);
  }

  handleCalculate() {
    const varId = this.$varSelector.val();
    const varData = typeof this.variables[varId] === 'string'
      ? this.stats.get(varId) : this.variables[varId].calculate();
    this.view.display({
      title: this.variables[varId],
      values: varData,
      fractional: (Math.max(...varData) <= 1),
    });
  }

  display(data) {
    this.view.display(data);
  }
}

module.exports = DataInspectorComponent;
