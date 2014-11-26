'use strict';
var winston = require('winston');
var LogstashUDP = require('winston-logstash-udp').LogstashUDP;
var AMQP = require('winston-amqp').AMQP;
var fs = require('fs');

function createLogger(conf, name) {
  if (!fs.existsSync('log')) {
    fs.mkdirSync('log');
  }
  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new LogstashUDP(conf.logstash)
    ]
  });
  logger.add(AMQP, conf.amqp);
  return logger;
}

module.exports = {
  createLogger: createLogger
};
