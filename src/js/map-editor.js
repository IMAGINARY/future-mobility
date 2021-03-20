import MapView from './map-view';
import MapEditorPalette from './map-editor-palette';

export default class MapEditor {
  constructor($element, city, config) {
    this.$element = $element;
    this.city = city;
    this.config = config;

    this.$element.addClass('map-editor');

    this.mapView = new MapView($('<div></div>').appendTo(this.$element), city, config);
    this.palette = new MapEditorPalette($('<div></div>').appendTo(this.$element), config);

    this.tileType = null;
    this.palette.events.on('change', (tileType) => {
      this.tileType = tileType;
    });

    this.mapView.events.on('click', ([i, j]) => {
      if (this.tileType) {
        this.city.set(i, j, this.tileType);
        this.mapView.renderTile(i, j);
      }
    });
  }
}
