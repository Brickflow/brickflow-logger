//* jshint camelcase: false */
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

var LOG_LEVELS = [
  'error',
  'warning',
  'info',
  'debug'
];

function flattenObject(nestedObject) {
  var flattened = {};
  var recurse = function(obj, prefix) {
    prefix = prefix || '';
    _.each(obj, function(val, key) {
      if (typeof(val) === 'object') {
        recurse(val, prefix + key + '.');
      } else {
        flattened[prefix + key] = val;
      }
    });
  };
  recurse(nestedObject);
  return flattened;
}

function transform(options) {
  try {
    validateOptions(options);
  } catch (error) {
    return null;
  }

  var req = options.req;
  return Object.freeze({
    level: options.level,
    ip: req && req.ips ? req.ips[0] : null,
    url: req.originalUrl,
    message: options.message,
    distinctId: req.user ? req.user.hash : req.cookies.guest,
    eventType: options.eventType,
    params: flattenObject(options.params),
    features: req.fflip.features,
    utm: req.session && req.session.utm,
    affiliateID: req.cookies.affiliate_id
  });
}

function validateOptions(options) {
  if (!options || !options.level || LOG_LEVELS.indexOf(options.level) === -1) {
    throw new Error('invalid log level');
  }
}

module.exports = transform;
