# brickflow-logger

``brickflow-logger`` is a logger around ``winston``, 
which aims to be a complete logging solution for node/express apps.

## Usage

```javascript

    var metrics = require('brickflow-logger')({
      logstash: { host, port, ... },
      amqp: { connection: require('amqp').createConnection({ ... }) }
    });
    
    var logger = metrics.createTracker('loggerName');
    logger.info('eventName', {
      some: 'options', 
      and: { it: ['canBe', 'nested'] } 
    });
    // => info: eventName url=undefined, ip=null, eventType=loggerName, 
    //    affiliateID=undefined, distinct_id=undefined, some=options, 
    //    and.it.0=canBe, and.it.1=nested

```

### Time measurement features

Create a time tracker and track some time:

```javascript

    var metrics = require('brickflow-logger')({...});
    var tracker = createTimeTracker('trackerName');    
    
    var measureDuration = tracker.time('you-name-it') // Starts the timer
    
    var lapInfo = measureDuration.lap('firstStepComplete', {some: 'moreInfo'});
    
    measureDuration.lap('allStepsComplete');
    
    var durationLogger = measureDuration.end(); // ends the timer
    var durationLogger = measureDuration.timeEnd('you-may-name-it') // same
```

At this point, ``durationLogger`` behaves as a logger (has ``info``, 
``error``, ...) except that it automatically logs the durations and dates 
based on the names you give *and* also contains the measured information, 
if you want to inspect what has happened.
     
```javascript     

    durationLogger.key === 'you-name-it'
    durationLogger.info('you-may-name-it-by-default', {optional: 'more info'});

```
### Funnel

``createFunnelTracker`` is similar, automatically logs when you call ``lap``.
 It can also be used with the more intutive ``start``-``step``-``end`` aliases.

```javascript

    var metrics = require('brickflow-logger')({...});
    var tracker = metrics.createFunnelTracker('somethingFunnel');
    var funnel = tracker.start('funnelName', {distinctRandom: 4});
    funnel.step('stepName'); // alias for ``lap()``
    funnel.step('happening', {optionalAdditionalLogInfo: true});
    funnel.end() // automatically logs a summary called 'funnelName'
    funnel.end(false) // end silently
```