class TileCounterView {
  constructor(stats, config) {
    this.stats = stats;
    this.config = config;

    this.stats.events.on("update", this.handleUpdate.bind(this));

    this.$element = $("<div></div>").addClass("tile-counter");

    this.computedFieldDefs = [
      {
        id: "road-density",
        label: "Road:Zone ratio",
        calculate: () => {
          const zones = this.stats.get("zones-residential-count"); // +
          //+ this.stats.get('zones-commercial-count')
          //this.stats.get("zones-industrial-count");

          return (this.stats.get("zones-road-count") / zones).toFixed(2);
        },
      },
      {
        id: "road-intersection-type",
        label: "Intersections (3x/4x)",
        calculate: () => {
          const tri = this.stats.get("road-triple-intersections-count");
          const quad = this.stats.get("road-quad-intersections-count");
          const total = this.stats.get("zones-road-count");
          return `${tri}(${((tri / total) * 100).toFixed(1)}%) / ${quad}(${(
            (quad / total) *
            100
          ).toFixed(1)}%)`;
        },
      },
    ];

    this.fields = Object.assign(
      Object.fromEntries(
        Object.keys(config.tileTypes).map((id) => [
          id,
          $("<span></span>").addClass("field"),
        ])
      ),
      Object.fromEntries(
        this.computedFieldDefs.map((field) => [
          field.id,
          $("<span></span>").addClass("field"),
        ])
      )
    );

    this.$element.append(
      $("<ul></ul>")
        .addClass("tile-counter-counts")
        .append(
          Object.keys(config.tileTypes).map((id) =>
            $("<li></li>")
              .append(
                $("<span></span>")
                  .addClass("label")
                  .html(
                    `${
                      config.tileTypes[id].name ||
                      config.tileTypes[id].type ||
                      id
                    }: `
                  )
              )
              .append(this.fields[id])
          )
        )
        .append(
          this.computedFieldDefs.map((field) =>
            $("<li></li>")
              .append(
                $("<span></span>").addClass("label").html(`${field.label}: `)
              )
              .append(this.fields[field.id])
          )
        )
    );

    this.total = this.stats.get("zones-total");

    this.handleUpdate();
  }

  handleUpdate() {
    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      const count = this.stats.get(`zones-${type}-count`);
      this.fields[id].text(
        `${count} (${((count / this.total) * 100).toFixed(1)}%)`
      );
    });

    this.computedFieldDefs.forEach(({ id, calculate }) => {
      this.fields[id].text(calculate());
    });
  }

  extraFieldDefs() {
    return [
      {
        id: "road-density",
        label: "Road density",
        calculate: () => {
          const zones = this.stats.get("zones-residential-count"); //+
          //+ this.stats.get('zones-commercial-count')
          //this.stats.get("zones-industrial-count");

          return this.stats.get("zones-road-count") / zones;
        },
      },
    ];
  }
}

module.exports = TileCounterView;
