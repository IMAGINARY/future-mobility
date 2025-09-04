class TwoColorTileRenderer {
  constructor(mapView, color1, color2) {
    this.mapView = mapView;
    this.color1 = color1;
    this.color2 = color2;
  }

  render() {
    return { bgColor1: this.color1, bgColor2: this.color2 };
  }
}

module.exports = TwoColorTileRenderer;
