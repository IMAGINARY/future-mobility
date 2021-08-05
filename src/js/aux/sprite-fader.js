class SpriteFader {
  constructor(sprite) {
    this.sprite = sprite;
    this.callback = null;
    this.duration = null;
    this.startAlpha = null;
    this.endAlpha = null;
  }

  fadeIn(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (this.endAlpha === 0 || (this.endAlpha === null && this.sprite.alpha !== 1)) {
      this.fade(0, 1, duration, callback);
    }
    if (callback) {
      if (this.endAlpha !== null) {
        this.callback = callback;
      } else {
        callback();
      }
    }
  }

  fadeOut(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (this.endAlpha === 1 || (this.endAlpha === null && this.sprite.alpha !== 0)) {
      this.fade(1, 0, duration, callback);
    }
    if (callback) {
      if (this.endAlpha !== null) {
        this.callback = callback;
      } else {
        setTimeout(() => { callback(); }, 0);
      }
    }
  }

  fade(startAlpha, endAlpha, duration = SpriteFader.DEFAULT_DURATION, callback = null) {
    this.callback = callback;
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.duration = duration;
    this.timer = 0;
  }

  onFadeEnd() {
    if (this.callback) {
      setTimeout(() => { this.callback(); }, 0);
    }
    this.startAlpha = null;
    this.endAlpha = null;
    this.duration = null;
    this.timer = 0;
  }

  animate(time) {
    if (this.endAlpha !== null) {
      this.timer = Math.min(this.duration, this.timer + time);
      this.sprite.alpha = this.startAlpha
        + (this.endAlpha - this.startAlpha) * (this.timer / this.duration);
      if (this.timer === this.duration) {
        this.onFadeEnd();
      }
    }
  }
}

SpriteFader.DEFAULT_DURATION = 20;

module.exports = SpriteFader;
