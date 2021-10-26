function average(data) {
  return data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : undefined;
}

function sortedQuantile(sortedData, q) {
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

function quantile(data, q) {
  return sortedQuantile(data.sort((a, b) => a - b), q);
}

function median(data) {
  return quantile(data, 0.5);
}

function sortedMedian(data) {
  return sortedQuantile(data, 0.5);
}

function firstQuartile(data) {
  return quantile(data, 0.25);
}

function sortedFirstQuartile(data) {
  return sortedQuantile(data, 0.25);
}

function thirdQuartile(data) {
  return quantile(data, 0.75);
}

function sortedThirdQuartile(data) {
  return sortedQuantile(data, 0.75);
}

function numberUnderValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] < k) {
      count += 1;
    }
  }

  return count;
}

function percentageUnderValue(data, k) {
  return data.length > 0 ? numberUnderValue(data, k) / data.length : 1;
}

function numberOverValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] > k) {
      count += 1;
    }
  }

  return count;
}

function percentageOverValue(data, k) {
  return data.length > 0 ? numberOverValue(data, k) / data.length : 1;
}

function numberEqualValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] === k) {
      count += 1;
    }
  }

  return count;
}

function percentageEqualValue(data, k) {
  return data.length > 0 ? numberEqualValue(data, k) / data.length : 1;
}

module.exports = {
  average,
  quantile,
  sortedQuantile,
  median,
  sortedMedian,
  firstQuartile,
  sortedFirstQuartile,
  thirdQuartile,
  sortedThirdQuartile,
  numberUnderValue,
  percentageUnderValue,
  numberOverValue,
  percentageOverValue,
  numberEqualValue,
  percentageEqualValue,
};
