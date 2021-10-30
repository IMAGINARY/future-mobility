const yaml = require('js-yaml');

class CfgLoader {
  constructor(cfgReader) {
    this.reader = cfgReader;
  }

  async load(files) {
    const segments = [];
    const promises = [];

    files.forEach((file, i) => {
      promises.push(
        this.reader(file)
          .then(cfgText => yaml.load(cfgText))
          .then((cfgSegment) => {
            // We keep the segments in order
            segments[i] = cfgSegment;
          })
      );
    });

    return Promise.all(promises).then(() => Object.assign({}, ...segments));
  }
}

module.exports = CfgLoader;
