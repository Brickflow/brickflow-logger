'use strict';
var _ = require('lodash');

module.exports = function timeTrackerFactory(tracker) {
  var timers = [];
  var lastAt;

  function time(key) {
    var t = {
      key: key || '_default',
      hash: Math.random().toString(36).split('.')[1],
      startedAt: new Date(),
      laps: {}
    };
    _.assign(t, {
      value: _.partial(value, t),
      lap: _.partial(lap, t),
      end: _.partial(timeEnd, t)
    });
    timers[key] = timers[key] || [];
    timers[key][t.hash] = t;
    return t;
  }

//  var value = (t) => _.omit(t, (v, k) => typeof v === 'function' || k === 'laps');
  function value(t) {
    return _.omit(t, function(v, k) {
      return typeof v === 'function' || k === 'laps';
    });
  }

  function lap(t, prefix) {
    var now = new Date;
    lastAt = now;
    var lap = {
      lapCount: t.laps.length,
      prefix: prefix,
      lapAt: now,
      stepDuration: now - lastAt,
      totalDuration: now - t.startedAt
    };
    t.laps[prefix || t.laps.length] = lap;
    return t;
  }

  function timeEndAll(key) {
    return _.map(t[key || '_default'], timeEnd);
  }

  function timeEnd(t) {
    var now = new Date();
    lastAt = now;

    _.assign(t, {
      endedAt: now.toString(),
      duration: now - t.startedAt,
      startedAt: t.startedAt.toString()
    });
    _.assign(t, _.mapValues(tracker, function(log) {
      return function(msg, payload) {
        log(msg||t.key, _.assign(payload || {}, value(t)));
      };
    }));
    _(t.laps).each(function(lap) {
      var lapInfo = {};
      lapInfo[lap.prefix + 'At'] = lap.lapAt.toString();
      lapInfo[lap.prefix + 'StepDuration'] = lap.stepDuration;
      lapInfo[lap.prefix + 'TotalDuration'] = lap.totalDuration;
      _.assign(t, lapInfo);
    });

    timers[t.key][t.hash] = undefined;
    if (_.isEmpty(timers[t.key])) {
      timers[t.key] = undefined;
    }
    return t;
  }

  return {
    time: time,
    lap: lap,
    timeEnd: timeEnd,
    timeEndAll: timeEndAll
  };
};
