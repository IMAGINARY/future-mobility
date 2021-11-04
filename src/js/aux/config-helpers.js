function getTileTypeId(config, type) {
  const entry = Object.entries(config.tileTypes).find(([, props]) => props.type === type);
  return entry ? Number(entry[0]) : null;
}

function getTileType(config, type) {
  const entry = Object.entries(config.tileTypes).find(([, props]) => props.type === type);
  return entry ? entry[1] : null;
}

module.exports = { getTileTypeId, getTileType };
