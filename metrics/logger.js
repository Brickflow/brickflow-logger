'use strict';
var winston = require('winston');
require('winston-logstash-udp');
var fs = require('fs');

function createLogger(conf, name) {
  if (!fs.existsSync('log')) {
    fs.mkdirSync('log');
  }
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({
        filename: 'log/' + name + '.log'
      }),
      new (winston.transports.LogstashUDP)(conf.logstash)
    ]
  });
}

module.exports = {
  createLogger: createLogger
};
