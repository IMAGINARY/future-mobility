function CfgReaderFetch(filename) {
  return fetch(filename, { cache: 'no-store' })
    .then((response) => (response.ok ? response.text() : ''));
}

module.exports = CfgReaderFetch;
