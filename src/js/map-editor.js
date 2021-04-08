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

    this.tileType = this.palette.tileId;
    this.palette.events.on('change', (tileType) => {
      this.tileType = tileType;
    });

    let lastEdit = null;
    this.mapView.events.on('action', ([x, y], props) => {
      if (this.tileType) {
        if (lastEdit && props.shiftKey) {
          const [lastX, lastY] = lastEdit;
          for (let i = Math.min(lastX, x); i <= Math.max(lastX, x); i += 1) {
            for (let j = Math.min(lastY, y); j <= Math.max(lastY, y); j += 1) {
              this.city.set(i, j, this.tileType);
            }
          }
        } else {
          this.city.set(x, y, this.tileType);
        }
        lastEdit = [x, y];
      }
    });
  }
}
