const Grid = require('../src/js/lib/model/grid');
const Array2D = require('../src/js/lib/data/array-2d');

describe('Grid', () => {
  describe('constructor', () => {
    describe('with valid arguments', () => {
      it('creates grid with specified dimensions', () => {
        const grid = new Grid(3, 2);
        expect(grid.width).toBe(3);
        expect(grid.height).toBe(2);
      });

      it('initializes cells to 0 when cells not provided', () => {
        const grid = new Grid(2, 2);
        expect(grid.cells).toEqual([[0, 0], [0, 0]]);
      });

      it('uses provided cells array', () => {
        const cells = [[1, 2], [3, 4]];
        const grid = new Grid(2, 2, cells);
        expect(grid.cells).toEqual([[1, 2], [3, 4]]);
      });

      it('works with 1x1 grid', () => {
        const grid = new Grid(1, 1);
        expect(grid.width).toBe(1);
        expect(grid.height).toBe(1);
        expect(grid.cells).toEqual([[0]]);
      });

      it('works with 1x1 grid with cells', () => {
        const grid = new Grid(1, 1, [[42]]);
        expect(grid.cells).toEqual([[42]]);
      });
    });

    describe('width and height validation', () => {
      it('throws when width is 0', () => {
        expect(() => new Grid(0, 5)).toThrow('Width and height must be greater than 0');
      });

      it('throws when height is 0', () => {
        expect(() => new Grid(5, 0)).toThrow('Width and height must be greater than 0');
      });

      it('throws when width is negative', () => {
        expect(() => new Grid(-1, 5)).toThrow('Width and height must be greater than 0');
      });

      it('throws when height is negative', () => {
        expect(() => new Grid(5, -1)).toThrow('Width and height must be greater than 0');
      });

      it('throws when both are 0', () => {
        expect(() => new Grid(0, 0)).toThrow('Width and height must be greater than 0');
      });
    });

    describe('cells validation', () => {
      it('throws when cells is not a 2D array', () => {
        expect(() => new Grid(2, 2, 'not an array')).toThrow('Cells must be a valid 2D array');
      });

      it('throws when cells is a 1D array', () => {
        expect(() => new Grid(2, 2, [1, 2, 3, 4])).toThrow('Cells must be a valid 2D array');
      });

      it('throws when cells is an empty array', () => {
        expect(() => new Grid(2, 2, [])).toThrow('Cells must be a valid 2D array');
      });

      it('throws when cells has empty inner arrays', () => {
        expect(() => new Grid(2, 2, [[], []])).toThrow('Cells must be a valid 2D array');
      });

      it('throws when cells is jagged', () => {
        expect(() => new Grid(2, 2, [[1, 2], [3]])).toThrow('Cells must be a valid 2D array');
      });

      it('throws when cells width does not match', () => {
        const cells = [[1, 2, 3], [4, 5, 6]];
        expect(() => new Grid(2, 2, cells)).toThrow('Cells dimensions must match width and height');
      });

      it('throws when cells height does not match', () => {
        const cells = [[1, 2], [3, 4], [5, 6]];
        expect(() => new Grid(2, 2, cells)).toThrow('Cells dimensions must match width and height');
      });

      it('throws when cells dimensions are swapped', () => {
        const cells = [[1, 2, 3], [4, 5, 6]];
        expect(() => new Grid(2, 3, cells)).toThrow('Cells dimensions must match width and height');
      });

      it('accepts null cells', () => {
        const grid = new Grid(2, 2, null);
        expect(grid.cells).toEqual([[0, 0], [0, 0]]);
      });
    });
  });

  describe('fromJSON', () => {
    it('creates grid from JSON object', () => {
      const json = { width: 3, height: 2, cells: [[1, 2, 3], [4, 5, 6]] };
      const grid = Grid.fromJSON(json);
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(2);
      expect(grid.cells).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('works with 1x1 grid', () => {
      const json = { width: 1, height: 1, cells: [[42]] };
      const grid = Grid.fromJSON(json);
      expect(grid.width).toBe(1);
      expect(grid.height).toBe(1);
      expect(grid.cells).toEqual([[42]]);
    });

    it('validates dimensions from JSON', () => {
      const json = { width: 0, height: 2, cells: [] };
      expect(() => Grid.fromJSON(json)).toThrow('Width and height must be greater than 0');
    });

    it('validates cells from JSON', () => {
      const json = { width: 2, height: 2, cells: [[1, 2, 3], [4, 5, 6]] };
      expect(() => Grid.fromJSON(json)).toThrow('Cells dimensions must match width and height');
    });
  });

  describe('toJSON', () => {
    it('returns object with width, height, and cells', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      const json = grid.toJSON();
      expect(json).toEqual({
        width: 2,
        height: 2,
        cells: [[1, 2], [3, 4]],
      });
    });

    it('clones cells array', () => {
      const cells = [[1, 2], [3, 4]];
      const grid = new Grid(2, 2, cells);
      const json = grid.toJSON();
      expect(json.cells).not.toBe(grid.cells);
      expect(json.cells[0]).not.toBe(grid.cells[0]);
    });

    it('modifying returned cells does not affect grid', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      const json = grid.toJSON();
      json.cells[0][0] = 99;
      expect(grid.cells[0][0]).toBe(1);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      const json = grid.toJSON();
      expect(json).toEqual({ width: 1, height: 1, cells: [[42]] });
    });

    it('roundtrips with fromJSON', () => {
      const original = new Grid(3, 2, [[1, 2, 3], [4, 5, 6]]);
      const json = original.toJSON();
      const restored = Grid.fromJSON(json);
      expect(restored.width).toBe(original.width);
      expect(restored.height).toBe(original.height);
      expect(restored.cells).toEqual(original.cells);
    });
  });

  describe('get', () => {
    it('returns value at coordinates', () => {
      const grid = new Grid(3, 2, [[1, 2, 3], [4, 5, 6]]);
      expect(grid.get(0, 0)).toBe(1);
      expect(grid.get(2, 0)).toBe(3);
      expect(grid.get(0, 1)).toBe(4);
      expect(grid.get(2, 1)).toBe(6);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      expect(grid.get(0, 0)).toBe(42);
    });

    it('returns correct value after set', () => {
      const grid = new Grid(2, 2);
      grid.set(1, 0, 99);
      expect(grid.get(1, 0)).toBe(99);
    });
  });

  describe('set', () => {
    it('sets value at coordinates', () => {
      const grid = new Grid(2, 2);
      grid.set(1, 0, 42);
      expect(grid.cells[0][1]).toBe(42);
    });

    it('overwrites existing value', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      grid.set(0, 0, 99);
      expect(grid.cells[0][0]).toBe(99);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1);
      grid.set(0, 0, 42);
      expect(grid.cells[0][0]).toBe(42);
    });

    it('can set non-numeric values', () => {
      const grid = new Grid(2, 2);
      grid.set(0, 0, 'test');
      expect(grid.get(0, 0)).toBe('test');
    });

    it('does not affect other cells', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      grid.set(0, 0, 99);
      expect(grid.cells).toEqual([[99, 2], [3, 4]]);
    });
  });

  describe('copy', () => {
    it('copies width, height, and cells from another grid', () => {
      const source = new Grid(3, 2, [[1, 2, 3], [4, 5, 6]]);
      const dest = new Grid(3, 2);
      dest.copy(source);
      expect(dest.width).toBe(3);
      expect(dest.height).toBe(2);
      expect(dest.cells).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('overwrites existing values', () => {
      const source = new Grid(2, 2, [[5, 6], [7, 8]]);
      const dest = new Grid(2, 2, [[1, 2], [3, 4]]);
      dest.copy(source);
      expect(dest.cells).toEqual([[5, 6], [7, 8]]);
    });

    it('does not modify source grid', () => {
      const source = new Grid(2, 2, [[1, 2], [3, 4]]);
      const dest = new Grid(2, 2);
      dest.copy(source);
      dest.set(0, 0, 99);
      expect(source.cells[0][0]).toBe(1);
    });

    it('works with 1x1 grid', () => {
      const source = new Grid(1, 1, [[42]]);
      const dest = new Grid(1, 1);
      dest.copy(source);
      expect(dest.cells).toEqual([[42]]);
    });
  });

  describe('replace', () => {
    it('replaces cells with new values', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      grid.replace([[5, 6], [7, 8]]);
      expect(grid.cells).toEqual([[5, 6], [7, 8]]);
    });

    it('keeps same cells array reference', () => {
      const grid = new Grid(2, 2);
      const originalCells = grid.cells;
      grid.replace([[1, 2], [3, 4]]);
      expect(grid.cells).toBe(originalCells);
    });

    it('does not modify source array', () => {
      const grid = new Grid(2, 2);
      const source = [[1, 2], [3, 4]];
      grid.replace(source);
      grid.set(0, 0, 99);
      expect(source[0][0]).toBe(1);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1);
      grid.replace([[42]]);
      expect(grid.cells).toEqual([[42]]);
    });
  });

  describe('isValidCoords', () => {
    it('returns true for valid coordinates', () => {
      const grid = new Grid(3, 2);
      expect(grid.isValidCoords(0, 0)).toBe(true);
      expect(grid.isValidCoords(2, 1)).toBe(true);
      expect(grid.isValidCoords(1, 0)).toBe(true);
    });

    it('returns false for negative x', () => {
      const grid = new Grid(3, 2);
      expect(grid.isValidCoords(-1, 0)).toBe(false);
    });

    it('returns false for negative y', () => {
      const grid = new Grid(3, 2);
      expect(grid.isValidCoords(0, -1)).toBe(false);
    });

    it('returns false for x >= width', () => {
      const grid = new Grid(3, 2);
      expect(grid.isValidCoords(3, 0)).toBe(false);
      expect(grid.isValidCoords(4, 0)).toBe(false);
    });

    it('returns false for y >= height', () => {
      const grid = new Grid(3, 2);
      expect(grid.isValidCoords(0, 2)).toBe(false);
      expect(grid.isValidCoords(0, 3)).toBe(false);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1);
      expect(grid.isValidCoords(0, 0)).toBe(true);
      expect(grid.isValidCoords(1, 0)).toBe(false);
      expect(grid.isValidCoords(0, 1)).toBe(false);
    });
  });

  describe('allCells', () => {
    it('returns all cells as [x, y, value] arrays', () => {
      const grid = new Grid(2, 2, [[1, 2], [3, 4]]);
      const cells = grid.allCells();
      expect(cells).toEqual([
        [0, 0, 1],
        [1, 0, 2],
        [0, 1, 3],
        [1, 1, 4],
      ]);
    });

    it('returns cells in row-major order', () => {
      const grid = new Grid(3, 2, [['a', 'b', 'c'], ['d', 'e', 'f']]);
      const values = grid.allCells().map((cell) => cell[2]);
      expect(values).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      expect(grid.allCells()).toEqual([[0, 0, 42]]);
    });
  });

  describe('adjacentCells', () => {
    it('returns four adjacent cells for center cell', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const adjacent = grid.adjacentCells(1, 1);
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual([1, 0, 2]); // top
      expect(adjacent).toContainEqual([2, 1, 6]); // right
      expect(adjacent).toContainEqual([1, 2, 8]); // bottom
      expect(adjacent).toContainEqual([0, 1, 4]); // left
    });

    it('returns two adjacent cells for corner', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const adjacent = grid.adjacentCells(0, 0);
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContainEqual([1, 0, 2]); // right
      expect(adjacent).toContainEqual([0, 1, 4]); // bottom
    });

    it('returns three adjacent cells for edge', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const adjacent = grid.adjacentCells(1, 0);
      expect(adjacent).toHaveLength(3);
      expect(adjacent).toContainEqual([2, 0, 3]); // right
      expect(adjacent).toContainEqual([1, 1, 5]); // bottom
      expect(adjacent).toContainEqual([0, 0, 1]); // left
    });

    it('does not include diagonals', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const adjacent = grid.adjacentCells(1, 1);
      const coords = adjacent.map(([x, y]) => `${x},${y}`);
      expect(coords).not.toContain('0,0');
      expect(coords).not.toContain('2,0');
      expect(coords).not.toContain('0,2');
      expect(coords).not.toContain('2,2');
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      expect(grid.adjacentCells(0, 0)).toEqual([]);
    });
  });

  describe('nearbyCoords', () => {
    it('returns coordinates at distance 1', () => {
      const grid = new Grid(5, 5);
      const coords = grid.nearbyCoords(2, 2, 1);
      expect(coords).toHaveLength(8);
      expect(coords).toContainEqual([1, 1]);
      expect(coords).toContainEqual([2, 1]);
      expect(coords).toContainEqual([3, 1]);
      expect(coords).toContainEqual([3, 2]);
      expect(coords).toContainEqual([3, 3]);
      expect(coords).toContainEqual([2, 3]);
      expect(coords).toContainEqual([1, 3]);
      expect(coords).toContainEqual([1, 2]);
    });

    it('filters out-of-bounds coordinates', () => {
      const grid = new Grid(3, 3);
      const coords = grid.nearbyCoords(0, 0, 1);
      coords.forEach(([x, y]) => {
        expect(grid.isValidCoords(x, y)).toBe(true);
      });
    });

    it('returns coordinates at distance 2', () => {
      const grid = new Grid(5, 5);
      const coords = grid.nearbyCoords(2, 2, 2);
      expect(coords).toContainEqual([0, 0]);
      expect(coords).toContainEqual([4, 4]);
    });

    it('returns empty for corner in 1x1 grid', () => {
      const grid = new Grid(1, 1);
      expect(grid.nearbyCoords(0, 0, 1)).toEqual([]);
    });
  });

  describe('nearbyCells', () => {
    it('returns cells at distance 1 with values', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const cells = grid.nearbyCells(1, 1, 1);
      expect(cells).toHaveLength(8);
      expect(cells).toContainEqual([0, 0, 1]);
      expect(cells).toContainEqual([1, 0, 2]);
      expect(cells).toContainEqual([2, 0, 3]);
      expect(cells).toContainEqual([2, 1, 6]);
      expect(cells).toContainEqual([2, 2, 9]);
      expect(cells).toContainEqual([1, 2, 8]);
      expect(cells).toContainEqual([0, 2, 7]);
      expect(cells).toContainEqual([0, 1, 4]);
    });

    it('defaults to distance 1', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const cells = grid.nearbyCells(1, 1);
      expect(cells).toHaveLength(8);
    });

    it('filters out-of-bounds cells', () => {
      const grid = new Grid(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const cells = grid.nearbyCells(0, 0, 1);
      expect(cells).toHaveLength(3);
      expect(cells).toContainEqual([1, 0, 2]);
      expect(cells).toContainEqual([1, 1, 5]);
      expect(cells).toContainEqual([0, 1, 4]);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      expect(grid.nearbyCells(0, 0, 1)).toEqual([]);
    });
  });

  describe('frequencyDistribution', () => {
    it('returns frequency of each value', () => {
      const grid = new Grid(3, 2, [[1, 2, 1], [2, 1, 3]]);
      const freq = grid.frequencyDistribution();
      expect(freq['1']).toBe(2);
      expect(freq['2']).toBe(1);
      expect(freq['3']).toBe(0);
    });

    it('returns empty object for grid with single value', () => {
      const grid = new Grid(2, 2, [[5, 5], [5, 5]]);
      const freq = grid.frequencyDistribution();
      expect(freq['5']).toBe(3);
    });

    it('works with 1x1 grid', () => {
      const grid = new Grid(1, 1, [[42]]);
      const freq = grid.frequencyDistribution();
      expect(freq['42']).toBe(0);
    });

    it('handles string values', () => {
      const grid = new Grid(2, 2, [['a', 'b'], ['a', 'a']]);
      const freq = grid.frequencyDistribution();
      expect(freq['a']).toBe(2);
      expect(freq['b']).toBe(0);
    });
  });
});
