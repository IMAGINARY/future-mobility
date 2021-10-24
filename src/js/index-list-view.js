const VariableRankView = require('./index-view');

class IndexListView {
  constructor(varDefs) {
    this.$element = $('<div></div>')
      .addClass('index-list');

    this.variableRankViews = Object.fromEntries(
      Object.entries(varDefs)
        .map(([id, def]) => [id, new VariableRankView(id, def)])
    );

    this.$element.append(
      $('<div></div>').addClass('variables')
        .append(...Object.values(this.variableRankViews).map(view => view.$element))
    );
  }

  setValues(varValues) {
    Object.entries(varValues).forEach(([id, value]) => {
      if (this.variableRankViews[id] !== undefined) {
        this.variableRankViews[id].setValue(value);
      }
    });
  }
}

module.exports = IndexListView;
