const Array2D = require('./array-2d');

function regionAreas(map, tileTypeIds) {
  const answer = [];
  const seen = Array2D.create(map.width, map.height, false);

  map.allCells().forEach(([x, y, value]) => {
    if (seen[y][x] === false && tileTypeIds.includes(value)) {
      const frontier = [[x, y]];
      seen[y][x] = true;
      let area = 0;
      while (frontier.length > 0) {
        const [currX, currY] = frontier.pop();
        area += 1;
        map.adjacentCells(currX, currY).forEach(([adjX, adjY, adjValue]) => {
          if (seen[adjY][adjX] === false && tileTypeIds.includes(adjValue)) {
            seen[adjY][adjX] = true;
            frontier.push([adjX, adjY]);
          }
        });
      }
      answer.push(area);
    }
  });

  return answer;
}

module.exports = {
  regionAreas,
};
