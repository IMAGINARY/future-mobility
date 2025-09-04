const deepmerge = require('deepmerge');

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

class CfgLoader {
  /**
   * Creates a new CfgLoader instance.
   *
   * @param {function} cfgReader A function that takes a file name and returns a promise that
   *  resolves to the file's contents.
   * @param {function} cfgParser A function that takes a string and returns a promise that
   *  resolves to the parsed configuration.
   */
  constructor(cfgReader, cfgParser) {
    this.reader = cfgReader;
    this.parser = cfgParser;
  }

  /**
   * Loads the configuration from the given files.
   *
   * @param {string[]} files The list of files to load.
   * @param {function} processor A function that takes a configuration segment, the file name
   *  and the index of the file in the list of files and returns the processed configuration.
   * @returns {Promise<object>}
   *  A promise that resolves to the merged configuration.
   */
  async load(files, processor = (cfg) => cfg) {
    const segments = [];
    const promises = [];

    files.forEach((file, i) => {
      promises.push(
        this.reader(file)
          .then((cfgText) => this.parser(cfgText))
          .then((cfgSegment) => {
            // We keep the segments in order
            segments[i] = processor(cfgSegment, file, i);
          })
          .catch((err) => {
            throw new Error(`Error in file ${file}: ${err}`);
          })
      );
    });

    return Promise.all(promises)
      .then(() => deepmerge.all(segments.filter((s) => s), { arrayMerge: overwriteMerge }));
  }
}

module.exports = CfgLoader;
