const Modal = require('../modal');

class ModalPowerUp extends Modal {
  constructor(config, selectablePowerUps) {
    super({
      title: 'Power-Ups',
      size: 'xl',
    });
    this.config = config;

    this.$selector = $('<div></div>').addClass(['row', 'powerups-selector-main'])
      .append(
        selectablePowerUps.map(powerUpId => $('<div></div>').addClass('col')
          .append(this.renderPowerUp(powerUpId))
        )
      )
      .appendTo(this.$body);
  }

  renderPowerUp(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.title.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.title.en)))
        .append($('<div></div>').addClass('image')
          .attr('style', `background-image: url('static/powerups/${powerUpId}.svg')`))
        .append($('<div></div>').addClass('description')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.description.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.description.en)))
        .on('click', () => {
          this.hide(powerUpId);
        })
    );
  }
}

module.exports = ModalPowerUp;
