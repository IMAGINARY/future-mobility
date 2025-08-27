const DataInspectorView = require('../data-inspector-view');

function initDevDataInspectorPane(config, stats, measureDistanceTool) {

  const dataInspectorView = new DataInspectorView();
  $('[data-component=dataInspector]').append(dataInspectorView.$element);
  measureDistanceTool.events.on('inspect', (data) => dataInspectorView.display(data));

  const variables = {
    'Travel times': 'travel-times',
    'Green space prox.': 'green-spaces-proximity',
    'Green space areas': 'green-spaces-areas',
    'Pollution (all)': 'pollution',
    'Pollution (resid.)': 'pollution-residential',
    'Noise (all)': 'noise',
    'Noise (resid.)': 'noise-residential',
  };

  const varSelector = $('<select></select>')
    .addClass(['form-control', 'form-control-sm', 'd-block'])
    .append(Object.keys(variables).map((name) => (
      $('<option></option>').text(name).attr('value', name)
    )));

  $('<div></div>').addClass(['row', 'mt-2'])
    .append($('<div></div>').addClass('col-8').append(varSelector))
    .append($('<div></div>').addClass('col-4 d-grid gap-2').append(
      $('<button></button>')
        .attr('type', 'button')
        .addClass(['btn', 'btn-primary', 'btn-sm'])
        .text('Calculate')
        .on('click', () => {
          const varName = varSelector.val();
          const varData = typeof variables[varName] === 'string'
            ? stats.get(variables[varName]) : variables[varName].calculate();
          dataInspectorView.display({
            title: varName,
            values: varData,
            fractional: (Math.max(...varData) <= 1),
          });
        })
    ))
    .appendTo($('[data-component=dataInspector]'));
}

module.exports = initDevDataInspectorPane;
