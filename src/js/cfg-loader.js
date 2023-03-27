const deepmerge = require('deepmerge');

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

class CfgLoader {
  constructor(cfgReader, cfgParser) {
    this.reader = cfgReader;
    this.parser = cfgParser;
  }

  async load(files) {
    const segments = [];
    const promises = [];

    files.forEach((file, i) => {
      promises.push(
        this.reader(file)
          .then(cfgText => this.parser(cfgText))
          .then((cfgSegment) => {
            // We keep the segments in order
            segments[i] = cfgSegment;
          })
      );
    });

    return Promise.all(promises).then(() => deepmerge.all(segments.filter(s => s), { arrayMerge: overwriteMerge }));
  }
}

module.exports = CfgLoader;
