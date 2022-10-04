class SpriteFader {
  constructor(sprite) {
    this.sprite = sprite;
    this.callback = null;
    this.duration = null;
    this.startAlpha = null;
    this.endAlpha = null;

    this.visible = this.sprite.alpha !== 0;
    this.isFading = false;
  }

  fadeIn(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (!this.visible) {
      this.visible = true;
      this.startFade(0, 1, duration, callback);
    }
    if (callback) {
      this.setCallback(callback);
    }
  }

  fadeOut(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (this.visible) {
      this.visible = false;
      this.startFade(1, 0, duration, callback);
    }
    if (callback) {
      this.setCallback(callback);
    }
  }

  setCallback(callback) {
    if (this.isFading) {
      this.callback = callback;
    } else {
      setTimeout(() => { callback(); }, 0);
    }
  }

  startFade(startAlpha, endAlpha, duration = SpriteFader.DEFAULT_DURATION, callback = null) {
    this.callback = callback;
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.duration = duration;
    this.isFading = true;
    this.timer = 0;
  }

  onFadeEnd() {
    if (this.callback) {
      setTimeout(() => {
        this.callback();
        this.callback = null;
      }, 0);
    }
    this.isFading = false;
    this.startAlpha = null;
    this.endAlpha = null;
    this.duration = null;
    this.timer = 0;
  }

  animate(time) {
    if (this.isFading) {
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
