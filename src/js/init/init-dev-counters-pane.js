const TileCounterView = require('../tile-counter-view');
const ZoneBalanceView = require('../zone-balance-view');

function initDevCountersPane(config, stats) {
  const counterView = new TileCounterView(stats, config);
  const zoneBalanceView = new ZoneBalanceView(stats, config);
  $('[data-component=counters]').append([
    counterView.$element,
    zoneBalanceView.$element,
  ]);
}

module.exports = initDevCountersPane;
