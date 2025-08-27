const CitizenRequestView = require('../citizen-request-view');
const CitizenRequestViewMgr = require('../citizen-request-view-mgr');

function initDevCitizenRequestsPane(config, stats) {
  const citizenRequestView = new CitizenRequestView(config);
  $('[data-component=citizen-request-container]').append(citizenRequestView.$element);
  const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);
  citizenRequestViewMgr.handleUpdate(stats.getGoals());
  stats.events.on('update', () => {
    citizenRequestViewMgr.handleUpdate(stats.getGoals());
  });
}

module.exports = initDevCitizenRequestsPane;
