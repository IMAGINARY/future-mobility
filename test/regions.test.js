const { findRegions } = require('../src/js/lib/data/regions');

describe('findRegions', () => {
  describe('single region spanning all the grid', () => {
    it('finds one region when all cells match', () => {
      const cells = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(9);
    });

    it('includes all coordinates in the region', () => {
      const cells = [
        [1, 1],
        [1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions[0]).toContainEqual([0, 0]);
      expect(regions[0]).toContainEqual([1, 0]);
      expect(regions[0]).toContainEqual([0, 1]);
      expect(regions[0]).toContainEqual([1, 1]);
    });

    it('regionMap references the same region for all cells', () => {
      const cells = [
        [1, 1],
        [1, 1],
      ];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regionMap[0][0]).toBe(regions[0]);
      expect(regionMap[0][1]).toBe(regions[0]);
      expect(regionMap[1][0]).toBe(regions[0]);
      expect(regionMap[1][1]).toBe(regions[0]);
    });
  });

  describe('no regions bigger than 1x1', () => {
    it('finds separate regions for isolated cells', () => {
      const cells = [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(5);
      regions.forEach((region) => {
        expect(region).toHaveLength(1);
      });
    });

    it('diagonal cells are not connected', () => {
      const cells = [
        [1, 0],
        [0, 1],
      ];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regions).toHaveLength(2);
      expect(regionMap[0][0]).not.toBe(regionMap[1][1]);
    });

    it('returns empty regions array when no cells match', () => {
      const cells = [
        [0, 0],
        [0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(0);
    });

    it('regionMap has null for non-matching cells', () => {
      const cells = [
        [1, 0],
        [0, 1],
      ];
      const { regionMap } = findRegions(cells, [1]);
      expect(regionMap[0][1]).toBeNull();
      expect(regionMap[1][0]).toBeNull();
    });
  });

  describe('regions in corners', () => {
    it('finds region in top-left corner', () => {
      const cells = [
        [1, 1, 0],
        [1, 0, 0],
        [0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
      expect(regions[0]).toContainEqual([0, 0]);
      expect(regions[0]).toContainEqual([1, 0]);
      expect(regions[0]).toContainEqual([0, 1]);
    });

    it('finds region in top-right corner', () => {
      const cells = [
        [0, 1, 1],
        [0, 0, 1],
        [0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
      expect(regions[0]).toContainEqual([1, 0]);
      expect(regions[0]).toContainEqual([2, 0]);
      expect(regions[0]).toContainEqual([2, 1]);
    });

    it('finds region in bottom-left corner', () => {
      const cells = [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
      expect(regions[0]).toContainEqual([0, 1]);
      expect(regions[0]).toContainEqual([0, 2]);
      expect(regions[0]).toContainEqual([1, 2]);
    });

    it('finds region in bottom-right corner', () => {
      const cells = [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
      expect(regions[0]).toContainEqual([2, 1]);
      expect(regions[0]).toContainEqual([1, 2]);
      expect(regions[0]).toContainEqual([2, 2]);
    });

    it('finds separate regions in all four corners', () => {
      const cells = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(4);
      regions.forEach((region) => {
        expect(region).toHaveLength(1);
      });
    });
  });

  describe('regions on sides', () => {
    it('finds region on top side', () => {
      const cells = [
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
    });

    it('finds region on bottom side', () => {
      const cells = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
    });

    it('finds region on left side', () => {
      const cells = [
        [0, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
    });

    it('finds region on right side', () => {
      const cells = [
        [0, 0, 0],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(3);
    });
  });

  describe('regions in center', () => {
    it('finds region in center of grid', () => {
      const cells = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(9);
    });

    it('finds single cell region in center', () => {
      const cells = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(1);
      expect(regions[0]).toContainEqual([1, 1]);
    });
  });

  describe('C-shaped region (concave)', () => {
    it('finds C-shaped region opening right', () => {
      const cells = [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(7);
    });

    it('finds C-shaped region opening left', () => {
      const cells = [
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(7);
    });

    it('finds C-shaped region opening up', () => {
      const cells = [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(7);
    });

    it('finds C-shaped region opening down', () => {
      const cells = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(7);
    });

    it('regionMap correctly maps all cells in C-shaped region', () => {
      const cells = [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
      ];
      const { regions, regionMap } = findRegions(cells, [1]);
      // All 1s should reference the same region
      expect(regionMap[0][0]).toBe(regions[0]);
      expect(regionMap[0][1]).toBe(regions[0]);
      expect(regionMap[0][2]).toBe(regions[0]);
      expect(regionMap[1][0]).toBe(regions[0]);
      expect(regionMap[2][0]).toBe(regions[0]);
      expect(regionMap[2][1]).toBe(regions[0]);
      expect(regionMap[2][2]).toBe(regions[0]);
      // Interior should be null
      expect(regionMap[1][1]).toBeNull();
      expect(regionMap[1][2]).toBeNull();
    });
  });

  describe('O-shaped region (donut/ring)', () => {
    it('finds O-shaped region with hole in center', () => {
      const cells = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(8);
    });

    it('center hole is not part of the region', () => {
      const cells = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regionMap[1][1]).toBeNull();
      expect(regions[0]).not.toContainEqual([1, 1]);
    });

    it('finds larger O-shaped region', () => {
      const cells = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(16);
      // Check interior is null
      expect(regionMap[1][1]).toBeNull();
      expect(regionMap[2][2]).toBeNull();
      expect(regionMap[3][3]).toBeNull();
    });

    it('finds O-shaped region with different tile type inside', () => {
      const cells = [
        [1, 1, 1],
        [1, 2, 1],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(8);
    });
  });

  describe('multiple tile types', () => {
    it('finds separate regions for each tile type', () => {
      const cells = [
        [1, 1, 2, 2],
        [1, 1, 2, 2],
      ];
      const { regions } = findRegions(cells, [1, 2]);
      expect(regions).toHaveLength(2);
      expect(regions[0]).toHaveLength(4);
      expect(regions[1]).toHaveLength(4);
    });

    it('finds separate regions when tile types are not adjacent', () => {
      const cells = [
        [1, 1, 0, 2, 2],
        [1, 1, 0, 2, 2],
      ];
      const { regions } = findRegions(cells, [1, 2]);
      expect(regions).toHaveLength(2);
      expect(regions[0]).toHaveLength(4);
      expect(regions[1]).toHaveLength(4);
    });

    it('ignores tile types not in includeTileTypes', () => {
      const cells = [
        [1, 2, 1],
        [2, 3, 2],
        [1, 2, 1],
      ];
      const { regionMap } = findRegions(cells, [1, 2]);
      expect(regionMap[1][1]).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles 1x1 grid with matching cell', () => {
      const cells = [[1]];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(1);
      expect(regions[0]).toContainEqual([0, 0]);
      expect(regionMap[0][0]).toBe(regions[0]);
    });

    it('handles 1x1 grid with non-matching cell', () => {
      const cells = [[0]];
      const { regions, regionMap } = findRegions(cells, [1]);
      expect(regions).toHaveLength(0);
      expect(regionMap[0][0]).toBeNull();
    });

    it('handles single row grid', () => {
      const cells = [[1, 1, 0, 1, 1]];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(2);
      expect(regions[0]).toHaveLength(2);
      expect(regions[1]).toHaveLength(2);
    });

    it('handles single column grid', () => {
      const cells = [[1], [1], [0], [1], [1]];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(2);
      expect(regions[0]).toHaveLength(2);
      expect(regions[1]).toHaveLength(2);
    });

    it('handles empty includeTileTypes array', () => {
      const cells = [
        [1, 1],
        [1, 1],
      ];
      const { regions, regionMap } = findRegions(cells, []);
      expect(regions).toHaveLength(0);
      expect(regionMap[0][0]).toBeNull();
    });

    it('handles L-shaped region', () => {
      const cells = [
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(5);
    });

    it('handles T-shaped region', () => {
      const cells = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(5);
    });

    it('handles plus-shaped region', () => {
      const cells = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(5);
    });
  });

  describe('complex scenarios', () => {
    it('finds multiple separate regions of same type', () => {
      const cells = [
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(4);
      regions.forEach((region) => {
        expect(region).toHaveLength(4);
      });
    });

    it('finds nested regions with different tile types', () => {
      const cells = [
        [1, 1, 1, 1, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 3, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 1, 1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1, 2, 3]);
      expect(regions).toHaveLength(3);
      const sizes = regions.map((r) => r.length).sort((a, b) => a - b);
      expect(sizes).toEqual([1, 8, 16]);
    });

    it('finds serpentine/snake-shaped region', () => {
      const cells = [
        [1, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
      ];
      const { regions } = findRegions(cells, [1]);
      expect(regions).toHaveLength(1);
      expect(regions[0]).toHaveLength(13);
    });
  });
});
