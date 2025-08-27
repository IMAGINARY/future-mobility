const IndexListView = require('../index-list-view');
const { mainVariables} = require('./data-src-cfg');
const GoalDebugView = require('../goal-debug-view');

function initDevIndexesPane(config, stats) {
  const indexListView = new IndexListView(config);
  $('[data-component="status"]').append(indexListView.$element);
  indexListView.setValues(Object.fromEntries(
    Object.entries(mainVariables)
      .map(([key]) => [key, 0])
  ));

  const goalDebugView = new GoalDebugView(stats.getGoals());
  $('[data-component="goal-debug-container"]').append(goalDebugView.$element);

  let indexesDirty = true;
  let indexesCooldownTimer = null;
  const indexesCooldownTime = 1000;

  const recalculateIndexes = () => {
    indexesDirty = true;
    if (indexesCooldownTimer === null) {
      indexListView.setValues(
        Object.fromEntries(
          Object.entries(mainVariables)
            .map(([key, varId]) => [key, stats.get(varId)])
        )
      );
      goalDebugView.setValues(stats.getGoals());
      indexesDirty = false;
      indexesCooldownTimer = setTimeout(() => {
        indexesCooldownTimer = null;
        if (indexesDirty) {
          recalculateIndexes();
        }
      }, indexesCooldownTime);
    }
  };

  stats.events.on('update', () => {
    recalculateIndexes();
  });
  recalculateIndexes();
}

module.exports = initDevIndexesPane;
