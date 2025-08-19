const ZoningData = require('../../src/js/data-sources/zoning-data');
const ZoneBalanceData = require('../../src/js/data-sources/zone-balance-data');
const PollutionData = require('../../src/js/data-sources/pollution-data');
const NoiseData = require('../../src/js/data-sources/noise-data');
const GreenSpacesData = require('../../src/js/data-sources/green-spaces-data');
const TravelTimesData = require('../../src/js/data-sources/travel-times-data');
const TrafficData = require('../../src/js/data-sources/traffic-data');
const RoadSafetyData = require('../../src/js/data-sources/road-safety-data');

const dataSrcCfg = {
  dataSources: [
    ZoningData,
    ZoneBalanceData,
    PollutionData,
    NoiseData,
    GreenSpacesData,
    TravelTimesData,
    TrafficData,
    RoadSafetyData,
  ],
  mainVariables: {
    'green-spaces': 'green-spaces-index',
    pollution: 'pollution-index',
    noise: 'noise-index',
    'travel-times': 'travel-times-index',
    'traffic-density': 'traffic-density-index',
    safety: 'road-safety-index',
  },
};

module.exports = dataSrcCfg;
