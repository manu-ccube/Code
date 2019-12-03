const AWS = require('aws-sdk');
const clog = require('cc-log');

exports.handler = async (event, context) => {
    clog.log(clog.level.DEBUG, "Incoming event: %j", event);
    return { 
        headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Headers": "*"
        },
        statusCode: 200,
        body: JSON.stringify({status: "success", "data": "Hello world!"})
    }
}