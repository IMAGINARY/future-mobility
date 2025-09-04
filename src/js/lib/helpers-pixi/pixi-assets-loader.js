/* globals PIXI */

class PixiAssetsLoader {
  constructor(basePath = null) {
    this.basePath = basePath || './textures';
    this.bundles = {};
  }

  addBundle(bundle, name, srcs) {
    if (this.bundles[bundle] === undefined) {
      this.bundles[bundle] = [];
    }
    if (this.bundles[bundle].includes(name)) {
      throw new Error(`Asset ${name} already exists in bundle ${bundle}`);
    }
    this.bundles[bundle].push({
      name,
      srcs,
    });
  }

  addSpritesheet(name) {
    this.addBundle(name, name, `${name}.json`);
  }

  addSpritesheets(names) {
    names.forEach((name) => this.addSpritesheet(name));
  }

  getManifest() {
    return {
      bundles: Object.entries(this.bundles).map(([name, assets]) => ({
        name,
        assets: assets.map((asset) => ({
          name: asset.name,
          srcs: asset.srcs,
          data: { scaleMode: PIXI.SCALE_MODES.NEAREST },
        })),
      })),
    };
  }

  getAllBundleIds() {
    return Object.keys(this.bundles);
  }

  async load() {
    return PIXI.Assets.init({
      basePath: this.basePath,
      manifest: this.getManifest(),
      defaultSearchParams: {
        t: Date.now(), // Cache buster
      },
    })
      .then(() => PIXI.Assets.loadBundle(this.getAllBundleIds()))
      .then((bundles) => {
        const textures = {};
        Object.entries(bundles).forEach(([bundleName, bundle]) => {
          Object.values(bundle).forEach((item) => {
            textures[bundleName] = textures[bundleName] || {};
            Object.assign(textures[bundleName], item.textures);
          });
        });

        return textures;
      });
  }

  static async loadSpritesheets(basePath, names) {
    const loader = new PixiAssetsLoader(basePath);
    loader.addSpritesheets(names);
    return loader.load();
  }
}

module.exports = PixiAssetsLoader;
