var _ = require('lodash');

module.exports = function(tracker, timeTracker) {
  function time(key, distinctOptions) {
    var t = timeTracker.time(key);
    return _.assign(t, {
      distinctOptions: distinctOptions || {},
      lap: _.partial(lap, t),
      step: _.partial(lap, t),
      end: _.partial(timeEnd, t)
    });
  }

  function lap(t, suffix, otherInfo) {
    var lap = timeTracker.lap(t, suffix);
    tracker[(otherInfo && otherInfo.err) ? 'error' : 'info'](
        t.key + '-' + suffix,
        _(otherInfo||{}).
            assign(t.distinctOptions).
            assign(lap.laps[suffix]).
            value());
    return lap;
  }

  function timeEnd(dt, otherInfo) {
    var t = timeTracker.timeEnd(dt);
    if (otherInfo !== false) {
      tracker.info(t.key, _.assign(t.distinctOptions, otherInfo));
    }
    return t;
  }

  function asyncStep() {
    var args = Array.prototype.slice.call(arguments);
    return function(data, cb) {
      if (typeof data === 'function') { cb = data; data = null; }
      lap.apply(null, args);
      cb(null, data);
    };
  }

  return {
    time: time,
    start: time,
    lap: lap,
    step: lap,
    timeEnd: timeEnd,

    asyncStep: asyncStep
  };
};