/**
 * Returns a throttled version of the given function, ensuring it is not called more frequently than
 * the specified interval.
 *
 * The throttled function works as follows:
 * - Executes the original function immediately on the first call.
 * - Starts a cooldown period (throttleTime) after each execution.
 * - If called again during the cooldown, it schedules one additional execution to run after the
 *   cooldown ends.
 * - Ensures that any calls made during the cooldown are eventually processed, but at most one extra
 *   execution is queued.
 *
 * @param {Function} fn - The function to be throttled.
 * @param {number} throttleTime - The cooldown period in milliseconds between allowed executions.
 * @returns {Function} A throttled wrapper around the original function.
 */
function createThrottledFunction(fn, throttleTime) {
  let isCoolingDown = false;
  let hasPendingCall = false;

  function invoke() {
    fn();
    isCoolingDown = true;
    setTimeout(() => {
      isCoolingDown = false;
      if (hasPendingCall) {
        hasPendingCall = false;
        invoke();
      }
    }, throttleTime);
  }

  return function throttled() {
    if (!isCoolingDown) {
      invoke();
    } else {
      hasPendingCall = true;
    }
  };
}

module.exports = createThrottledFunction;
