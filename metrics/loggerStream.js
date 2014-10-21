/* jshint camelcase: false */
'use strict';

var _ = require('lodash');

_.mixin({
  mapKeys: function mapKeys(input, mapper, context) {
    return _.reduce(input, function(output, v, k) {
      output[mapper.call(context, v, k, input)] = v;
      return output;
    }, {}, context);
  }
});

var stream = require('stream');

function loggerStreamFactory(createLogger, conf, type) {
  var logger = createLogger(conf, type);
  if (!logger) { throw new Error('No logger factory provided'); }
  var loggerStream = new stream.Writable({objectMode: true});

  loggerStream._write = function(chunk, enc, next) {
    var loggerParams = _.pick(chunk, [
      'url',
      'ip',
      'eventType',
      'affiliateID'
    ]);

    loggerParams.distinct_id = chunk.distinctId;

    _.extend(loggerParams,
        prefixObject(chunk.features, 'feature'),
        prefixObject(chunk.utm, 'utm'),
        chunk.params);

    logger[chunk.level](chunk.message, loggerParams);
    next();
  };

  return loggerStream;
}

function prefixObject(object, prefix) {
  return  _.mapKeys(object, function(value, key) {
    return prefix + '-' + key;
  });
}

module.exports = loggerStreamFactory;
