const roadDensityCounter = {
  id: 'road-density',
  label: 'Road:Zone ratio',
  calculate: (stats) => {
    const zones = stats.get('zones-residential-count')
      + stats.get('zones-commercial-count')
      + stats.get('zones-industrial-count');

    return (stats.get('zones-road-count') / zones).toFixed(2);
  },
};

const roadIntersectionCounter = {
  id: 'road-intersection-type',
  label: 'Intersections (3x/4x)',
  calculate: (stats) => {
    const tri = stats.get('road-triple-intersections-count');
    const quad = stats.get('road-quad-intersections-count');
    const total = stats.get('zones-road-count');
    return `${tri}(${((tri / total) * 100).toFixed(1)}%) / ${quad}(${((quad / total) * 100).toFixed(1)}%)`;
  },
};

module.exports = { roadDensityCounter, roadIntersectionCounter };
