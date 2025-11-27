class VariableMapOverlayTransition {
  constructor(duration, inView, outView, onCompleteCallback) {
    this.duration = duration;
    this.elapsed = 0;
    this.inView = inView;
    this.outView = outView;
    this.onCompletCallback = onCompleteCallback;
    this.finished = false;
  }

  animate(time) {
    if (!this.finished) {
      this.elapsed += time;

      this.outView.alpha = 1 - Math.min(this.elapsed / this.duration, 1);
      this.inView.alpha = Math.min(this.elapsed / this.duration, 1);
      if (this.elapsed > this.duration) {
        this.finished = true;
        this.onCompletCallback();
      }
    }
  }

  finish() {
    if (!this.finished) {
      this.elapsed = this.duration;
      this.outView.alpha = 0;
      this.inView.alpha = 1;
      this.finished = true;
      this.onCompletCallback();
    }
  }
}

module.exports = VariableMapOverlayTransition;
