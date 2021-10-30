function CfgReaderFetch(filename) {
  return fetch(filename, { cache: 'no-store' })
    .then(response => response.text());
}

module.exports = CfgReaderFetch;
