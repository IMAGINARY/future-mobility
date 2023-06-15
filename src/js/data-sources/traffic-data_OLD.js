const DataSource = require("../data-source");

class TrafficData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.zoneCount = 0;
    this.roadCount = 0;

    this.goodDelta =
      config.goals["traffic-density"]["road-zone-ratio-delta-good"] || 0.1;
    this.fairDelta =
      config.goals["traffic-density"]["road-zone-ratio-delta-fair"] || 0.35;
  }

  getVariables() {
    return {
      "traffic-density-index": () => this.getTrafficDensityIndex(),
    };
  }

  calculate() {
    this.zoneCount =
      this.dataManager.get("zones-residential-count") +
      +this.dataManager.get("zones-commercial-count");
    this.dataManager.get("zones-industrial-count");
    this.roadCount = this.dataManager.get("zones-road-count");
  }

  getTrafficDensityIndex() {
    const base =
      1 +
      (this.zoneCount === 0 ||
      Math.abs(1 - this.roadCount / this.zoneCount) <= this.goodDelta
        ? 1
        : 0) +
      (this.zoneCount === 0 ||
      Math.abs(1 - this.roadCount / this.zoneCount) <= this.fairDelta
        ? 1
        : 0);

    return Math.max(
      1,
      Math.min(
        5,
        this.dataManager
          .getModifiers("traffic-density-index")
          .reduce((acc, modifier) => acc + modifier, base)
      )
    );
  }

  getGoals() {
    return [
      {
        id: "road-count-high",
        category: "roads",
        priority: 1,
        condition:
          this.zoneCount === 0 ||
          this.roadCount / this.zoneCount < 1 + this.goodDelta,
        progress: this.goalProgress(
          this.zoneCount / this.roadCount,
          1 - this.goodDelta
        ),
      },
      {
        id: "road-count-low",
        category: "roads",
        priority: 1,
        condition:
          this.zoneCount === 0 ||
          this.roadCount / this.zoneCount > 1 - this.goodDelta,
        progress: this.goalProgress(
          this.roadCount / this.zoneCount,
          1 - this.goodDelta
        ),
      },
    ];
  }
}

module.exports = TrafficData;
