/* globals Chart */

const {
  average, sortedMedian, sortedFirstQuartile, sortedThirdQuartile,
} = require('./aux/statistics');

class DataInspectorView {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('data-inspector');
    this.$canvas = $('<canvas></canvas>').appendTo(this.$element);
    this.$infoPane = $('<div></div>')
      .addClass('data-inspector-info')
      .appendTo(this.$element);
    this.chart = new Chart(this.$canvas, {
      type: 'bar',
    });
  }

  display(data) {
    const distribution = DataInspectorView.asFrequencyDistribution(data.values, data.fractional);
    this.chart.data = {
      labels: Object.keys(distribution),
      datasets: [{
        label: data.title,
        data: Object.values(distribution),
      }],
    };
    this.chart.update();

    const info = DataInspectorView.distributionInfo(data.values);
    this.$infoPane.empty()
      .append(info.map(indicator => $('<div></div>').addClass('indicator')
        .append($('<span></span>').addClass('label').text(`${indicator.title}: `))
        .append($('<span></span>').addClass('value').text(indicator.value))));
  }

  static asFrequencyDistribution(values, fractional) {
    const data = {};

    if (fractional) {
      for (let i = 0; i <= 1; i += 0.1) {
        data[i.toFixed(1)] = 0;
      }
      values.forEach((v) => {
        data[v.toFixed(1)] = (data[v.toFixed(1)] || 0) + 1;
      });
    } else {
      values.forEach((v) => {
        data[Math.floor(v)] = (data[Math.floor(v)] || 0) + 1;
      });
    }
    return data;
  }

  static distributionInfo(data) {
    const formatNumber = n => (n !== undefined ? n.toFixed(2) : '-');

    const sorted = data.sort((a, b) => a - b);
    return [
      { title: 'Count', value: data.length },
      { title: 'Range', value: DataInspectorView.range(sorted) },
      { title: 'Average', value: formatNumber(average(data)) },
      { title: 'Median', value: formatNumber(sortedMedian(sorted)) },
      { title: 'Q1', value: formatNumber(sortedFirstQuartile(sorted)) },
      { title: 'Q3', value: formatNumber(sortedThirdQuartile(sorted)) },
    ];
  }

  static range(sortedData) {
    if (sortedData.length === 0) {
      return '[]';
    }
    return `[${sortedData.at(0)}, ${sortedData.at(-1)}]`;
  }
}

module.exports = DataInspectorView;
