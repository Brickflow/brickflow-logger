'use strict';
var winston = require('winston');
var LogstashUDP = require('winston-logstash-udp').LogstashUDP;
var AMQP = require('winston-amqp').AMQP;
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
      new AMQP(conf.amqp),
      new LogstashUDP(conf.logstash)
    ]
  });
}

module.exports = {
  createLogger: createLogger
};
