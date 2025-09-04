const CanvasVariableMapView = require('../canvas-variable-map-view');

function initDevMappedVariableViewers(config, $parent, city, stats) {
  const emissionsVarCanvasViewer = new CanvasVariableMapView(
    city.map.width,
    city.map.height,
    0x8f2500,
    0xffffff
  );
  $parent.append(
    $('<div></div>')
      .addClass('mb-3')
      .append([
        $('<h2></h2>')
          .addClass('small')
          .text('Pollution'),
        emissionsVarCanvasViewer.$canvas,
      ])
  );

  const noiseVarCanvasViewer = new CanvasVariableMapView(
    city.map.width,
    city.map.height,
    0x0e95ff,
    0xffffff
  );
  $parent.append(
    $('<div></div>')
      .addClass('mb-3')
      .append([
        $('<h2></h2>')
          .addClass('small')
          .text('Noise'),
        noiseVarCanvasViewer.$canvas,
      ])
  );

  stats.events.on('update', () => {
    emissionsVarCanvasViewer.update(stats.get('pollution-map'));
    noiseVarCanvasViewer.update(stats.get('noise-map'));
  });
}

module.exports = initDevMappedVariableViewers;
