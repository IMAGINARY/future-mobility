/* globals PIXI */

class AssetsLoader {
  constructor(basePath = null) {
    this.basePath = basePath || './textures';
    this.bundles = {};
  }

  addToManifest(bundle, name, srcs) {
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

  addSpritesheet(name) {
    this.addToManifest(name, name, `${name}.json`);
  }

  addFolder(name, keys) {
    keys.forEach((key) => {
      this.addToManifest(name, key, `${name}/${key}.png`);
    });
  }

  load() {
    // PIXI.Assets.resolver.setDefaultSearchParams({
    //   t: Date.now(), // Cache buster
    // });
    return PIXI.Assets.init({
      basePath: this.basePath,
      manifest: this.getManifest(),
      defaultSearchParams: {
        t: Date.now(), // Cache buster
      },
    })
      .then(() => PIXI.Assets.loadBundle(this.getAllBundleIds()))
      .then((bundles) => {
        console.log('Assets loaded:', bundles);
        const textures = {};
        Object.entries(bundles).forEach(([bundleName, bundle]) => {
          Object.entries(bundle).forEach(([itemName, item]) => {
            if (item.textures) {
              textures[bundleName] = textures[bundleName] || {};
              Object.assign(textures[bundleName], item.textures);
            } else {
              textures[bundleName] = textures[bundleName] || {};
              textures[bundleName][itemName] = item;
            }
          });
        });

        return textures;
      });
  }
}

module.exports = AssetsLoader;
