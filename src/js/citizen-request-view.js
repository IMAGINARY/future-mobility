const { randomItem } = require('./lib/random');
const { getTileType } = require('./lib/config-helpers');

class CitizenRequestView {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('citizen-requests');

    this.requests = {};

    this.tileColors = Object.fromEntries(
      Object.entries(CitizenRequestView.tileReferences)
        .map(([key, type]) => [key, getTileType(this.config, type).color])
    );
  }

  displayRequest(goalId) {
    if (this.requests[goalId] === undefined && this.config.citizenRequests[goalId] !== undefined) {
      this.requests[goalId] = $('<div></div>')
        .addClass('request')
        .append($('<div></div>').addClass('request-person')
          .css({
            'background-image': `url(${this.getRandomCitizenIcon(goalId)})`,
          }))
        .append($('<div></div>').addClass('request-balloon')
          .append($('<div></div>').addClass('request-text-de')
            .html(this.formatRequestText(this.config.citizenRequests[goalId].de)))
          .append($('<div></div>').addClass('request-text-en')
            .html(this.formatRequestText(this.config.citizenRequests[goalId].en))))
        .appendTo(this.$element);
    }
  }

  removeRequest(goalId) {
    if (this.requests[goalId] !== undefined) {
      this.requests[goalId].remove();
      delete this.requests[goalId];
    }
  }

  getRandomCitizenIcon(goalId) {
    const urgent = this.config.citizenRequests[goalId].urgent || false;
    const icons = urgent ? this.config.citizenIcons.urgent : this.config.citizenIcons.regular;
    return randomItem(icons);
  }

  formatRequestText(text) {
    return text
      .replaceAll(CitizenRequestView.tileRefRegexp, (match, tileSpec, innerText) => (
        `<span class="tileref tileref-${CitizenRequestView.tileReferences[tileSpec]}">
<span class="tileref-stub" style="background-color: ${this.tileColors[tileSpec]}"></span> ${innerText}
</span>`
      ))
      .replaceAll(CitizenRequestView.largeTextRegexp, '<span class="large">$1</span>');
  }
}

CitizenRequestView.tileReferences = {
  W: 'water',
  P: 'park',
  R: 'residential',
  C: 'commercial',
  I: 'industrial',
  X: 'road',
};
CitizenRequestView.tileRefRegexp = new RegExp(
  `([${Object.keys(CitizenRequestView.tileReferences).join('')}])\\[([^\\]]+)\\]`, 'g'
);

CitizenRequestView.largeTextRegexp = /\*([^*]+)\*/g;

module.exports = CitizenRequestView;
