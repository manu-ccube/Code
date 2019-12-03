const asyncRedis = require("async-redis");
const winston = require('winston');
const {promisify} = require('util');

require('winston-logstash');

var options = {
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: false
    },
    logstash: {
        level: 'debug',
        port: 5514,
        host: process.env.LOGSTASH,
        ssl_enable: false,
        max_connect_retries: 3    ,
        label: 'CLOGS'
    }
  };

var logger = new winston.Logger({
    transports: [      
      new winston.transports.Console(options.console),
      new winston.transports.Logstash(options.logstash)
    ],
    exitOnError: true, // do not exit on handled exceptions
  });
  
const log2stash= promisify(logger.log).bind(logger);

exports.handler = async (event) => {
    var redis = null;
    try {
        redis = await redisConnection();
    }
    catch(e) {
        return JSON.stringify({status: "Error: Can't connect to Redis"});
    }
    
    var keys = await redis.hkeys("logs_debug");
    var logCount = keys.length 
    for (var key of keys) {
        let v = await redis.hget("logs_debug", key);
        var res = await log2stash('debug', v);
        res = await redis.hdel("logs_debug", key, function() {});
    }

    keys = await redis.hkeys("logs_info");
    logCount += keys.length 
    for (var key of keys) {
        let v = await redis.hget("logs_info", key);
        var res = await log2stash('info', v);
        res = await redis.hdel("logs_info", key, function() {});
    }

    keys = await redis.hkeys("logs_warning");
    logCount += keys.length 
    for (var key of keys) {
        let v = await redis.hget("logs_warning", key);
        var res = await log2stash('warning', v);
        res = await redis.hdel("logs_warning", key, function() {});
    }

    keys = await redis.hkeys("logs_error");
    logCount += keys.length 
    for (var key of keys) {
        let v = await redis.hget("logs_error", key);
        var res = await log2stash('error', v);
        res = await redis.hdel("logs_error", key, function() {});
    }


    let result = JSON.stringify({status: "success", count: logCount});
    console.log(result);
    return result;
}

let redisConnection = async() => {
    return new Promise((resolve, reject) => {
        let endpoint = process.env.REDIS_RW_NODE;
            var redis = asyncRedis.createClient({
            url: endpoint,
            retry_strategy: function(options) {
                console.log(options)
                if (options.total_retry_time > 3000) {
                    console.log('can`t connect to redis')
                }
                if (options.attempt > 5) {
                    // End reconnecting with built in error
                    return undefined;
                }
            }
        });
            
        //connect to redis
        redis.on("connect", function () {
            console.log("connected");
            resolve(redis);
        });
    });
}