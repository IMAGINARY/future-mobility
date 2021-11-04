class CitizenRequestViewMgr {
  constructor(citizenRequestView, requestCount = 3) {
    this.view = citizenRequestView;
    this.requestCount = requestCount;
    this.config = this.view.config;
    this.groups = this.getGroups();

    this.shownRequests = {};
    this.lastShowTime = {};

    this.minTime = (this.config.citizenRequestView.minTime || 30) * 1000;
    this.maxTime = (this.config.citizenRequestView.maxTime || 90) * 1000;
    this.cooldownTime = (this.config.citizenRequestView.cooldownTime || 90) * 1000;
  }

  displayRequest(goalId) {
    if (this.shownRequests[goalId] === undefined) {
      this.shownRequests[goalId] = true;
      this.lastShowTime[goalId] = Date.now();
      this.view.displayRequest(goalId);
    }
  }

  removeRequest(goalId) {
    if (this.shownRequests[goalId] !== undefined) {
      delete this.shownRequests[goalId];
      this.view.removeRequest(goalId);
    }
  }

  handleUpdate(goals) {
    const selectedGoals = this.selectElegibleGoals(goals)
      .slice(0, this.requestCount);

    // Remove goals that are not selected
    Object.keys(this.shownRequests).forEach((goalId) => {
      if (!selectedGoals.find(goal => goal.id === goalId)) {
        this.removeRequest(goalId);
      }
    });

    // Add selected goals
    selectedGoals.forEach((goal) => {
      this.displayRequest(goal.id);
    });
  }

  getGroups() {
    const answer = {};
    let id = 0;
    Object.values(this.config.citizenRequests).forEach((request) => {
      if (answer[request.group] === undefined) {
        answer[request.group] = id;
        id += 1;
      }
    });
    // Add a catch-all group
    if (answer.others === undefined) {
      answer.others = id;
    }
    return answer;
  }

  getVisibilityGroup(goal, now) {
    if (this.lastShowTime[goal.id] === undefined) {
      return CitizenRequestViewMgr.Timing.NORMAL;
    }

    const timeSinceShow = now - this.lastShowTime[goal.id];
    const cooldownEnter = this.maxTime;
    const cooldownExit = cooldownEnter + this.cooldownTime;
    if (timeSinceShow < this.minTime) {
      return CitizenRequestViewMgr.Timing.UNDER_MIN_TIME;
    }
    if ((timeSinceShow > cooldownEnter) && (timeSinceShow < cooldownExit)) {
      return CitizenRequestViewMgr.Timing.IN_COOLDOWN;
    }
    return CitizenRequestViewMgr.Timing.NORMAL;
  }

  selectElegibleGoals(goals) {
    const interleavedOrder = {};
    const visibilityGroup = {};
    const goalsPerGroup = Object.fromEntries(Object.keys(this.groups).map(group => [group, 0]));
    const now = Date.now();

    const unmetGoals = goals.filter(goal => goal.condition === false);

    unmetGoals.sort((a, b) => (
      // Sort by "priority, progress DESC"
      (a.priority - b.priority) || (b.progress - a.progress)
    )).forEach((goal) => {
      // Assign each goal a visibility group based on the last time it was shown
      visibilityGroup[goal.id] = this.getVisibilityGroup(goal, now);

      // Assign each goal an order so they are interleaved per group
      // (cat1, cat2, cat3, cat1, cat2, cat3, etc..) keeping the same
      // order they had within each category.
      const group = this.config.citizenRequests[goal.id].group || 'others';
      interleavedOrder[goal.id] = this.groups[group] + goalsPerGroup[group] * this.groups.length;
      goalsPerGroup[group] += 1;
    });

    return unmetGoals
      .sort((a, b) => (
        // Sort by visible time, then interleaved order
        (visibilityGroup[a.id] - visibilityGroup[b.id])
        || (interleavedOrder[a.id] - interleavedOrder[b.id])
      ));
  }
}

CitizenRequestViewMgr.Timing = {
  UNDER_MIN_TIME: 0,
  NORMAL: 1,
  IN_COOLDOWN: 2,
};

module.exports = CitizenRequestViewMgr;
