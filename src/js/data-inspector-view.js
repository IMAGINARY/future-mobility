/* globals Chart */
const Array2D = require('./aux/array-2d');

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
    const distribution = DataInspectorView.asDiscreteFrequency(data.values);
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

  static asDiscreteFrequency(values) {
    const data = {};

    values.forEach((v) => {
      data[Math.floor(v)] = (data[Math.floor(v)] || 0) + 1;
    });
    return data;
  }

  static distributionInfo(data) {
    const formatNumber = n => (n !== undefined ? n.toFixed(2) : '-');

    const sorted = data.sort((a, b) => a - b);
    return [
      { title: 'Count', value: data.length },
      { title: 'Range', value: DataInspectorView.range(sorted) },
      { title: 'Average', value: formatNumber(DataInspectorView.average(data)) },
      { title: 'Median', value: formatNumber(DataInspectorView.quantile(sorted, 0.5)) },
      { title: 'Q1', value: formatNumber(DataInspectorView.quantile(sorted, 0.25)) },
      { title: 'Q3', value: formatNumber(DataInspectorView.quantile(sorted, 0.75)) },
    ];
  }

  static range(sortedData) {
    if (sortedData.length === 0) {
      return '[]';
    }
    return `[${sortedData.at(0)}, ${sortedData.at(-1)}]`;
  }

  static average(data) {
    return data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : undefined;
  }

  static quantile(sortedData, q) {
    if (sortedData.length === 0) {
      return undefined;
    }
    const pos = (sortedData.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedData[base + 1] !== undefined) {
      return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
    }
    return sortedData[base];
  }
}

module.exports = DataInspectorView;
