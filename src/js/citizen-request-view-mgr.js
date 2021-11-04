class CitizenRequestViewMgr {
  constructor(citizenRequestView, requestCount = 3) {
    this.view = citizenRequestView;
    this.requestCount = requestCount;
  }

  handleUpdate(goals) {
    // Remove goals that were completed
    goals.forEach((goal) => {
      if (goal.condition === true && this.view.requests[goal.id] !== undefined) {
        this.view.removeRequest(goal.id);
      }
    });

    // Add elegible goals
    if (Object.keys(this.view.requests).length < this.requestCount) {
      this.selectElegibleGoals(goals)
        .filter(goal => this.view.requests[goal.id] === undefined)
        .slice(0, this.requestCount - Object.keys(this.view.requests).length)
        .forEach((goal) => {
          this.view.displayRequest(goal.id);
        });
    }
  }

  selectElegibleGoals(goals) {
    return goals
      .filter(goal => goal.condition === false)
      .sort((a, b) => {
        // Sort by priority first, by progress (DESC) second
        if (a.priority === b.priority) {
          return b.progress - a.progress;
        }
        return a.priority - b.priority;
      });
  }
}

module.exports = CitizenRequestViewMgr;
