'use strict';

var _ = require('lodash');

var stream = require('stream');
var loggerStreamFactory = require('./loggerStream');
var createLogger = require('./logger').createLogger;
var transform = require('./transform');

module.exports = function(transportConf) {
  return {
    createTracker: function createTracker(type, req, ban) {
      req = req && req.user ? req : {user: {}, fflip: {}, cookies: {}};
      ban = ban || {};
      if (req.fflip.setForUser) {
        req.fflip.setForUser({
          hash: req.user && req.user.hash || req.cookies.guest
        });
      }
      var passThrough = new stream.PassThrough({objectMode: true});
      var loggerStream = loggerStreamFactory(createLogger, transportConf, type);

      if (!ban.log) {
        passThrough.pipe(loggerStream);
      }

      return _.reduce([
        'info',
        'debug',
        'warning',
        'error'
      ], function(acc, elem) {
        acc[elem] = function(eventName, params) {
          passThrough.write(transform({
            level: elem,
            req: req,
            message: eventName,
            eventType: type,
            params: params
          }));
        };
        return acc;
      }, {});
    }
  };
};
