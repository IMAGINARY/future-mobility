const ZoningData = require('../data-sources/zoning-data');
const ZoneBalanceData = require('../data-sources/zone-balance-data');
const PollutionData = require('../data-sources/pollution-data');
const NoiseData = require('../data-sources/noise-data');
const GreenSpacesData = require('../data-sources/green-spaces-data');
const TravelTimesData = require('../data-sources/travel-times-data');
const TrafficData = require('../data-sources/traffic-data');
const RoadSafetyData = require('../data-sources/road-safety-data');

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
  devToolVariables: {
    'travel-times': 'Travel times',
    'green-spaces-proximity': 'Green space prox.',
    'green-spaces-areas': 'Green space areas',
    pollution: 'Pollution (all)',
    'pollution-residential': 'Pollution (resid.)',
    noise: 'Noise (all)',
    'noise-residential': 'Noise (resid.)',
  },
};

module.exports = dataSrcCfg;
