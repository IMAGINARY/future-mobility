class GoalDebugView {
  constructor(goals) {
    this.$element = $('<div></div>')
      .addClass('goal-debug');

    this.progress = Object.fromEntries(
      goals.map(goal => [goal.id, $('<span></span>')
        .addClass('goal-progress')])
    );

    this.items = Object.fromEntries(
      goals.map(goal => [goal.id, $('<div></div>')
        .append($('<span></span>').addClass('id').text(goal.id))
        .append(this.progress[goal.id])
        .appendTo(this.$element)])
    );

    this.values = Object.fromEntries(
      goals.map(goal => [goal.id, {
        met: null,
        progress: null,
      }])
    );
  }

  setValues(goals) {
    goals.forEach((goal) => {
      if (this.values[goal.id].met !== goal.condition) {
        this.values[goal.id].met = goal.condition;
        this.items[goal.id].removeClass();
        this.items[goal.id].addClass(goal.condition ? 'text-success' : 'text-danger');
      }
      if (this.values[goal.id].progress !== goal.progress) {
        this.values[goal.id].progress = goal.progress;
        this.progress[goal.id].text(` (${Math.round(goal.progress * 100)}%)`);
      }
    });
  }
}

module.exports = GoalDebugView;
