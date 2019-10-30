const AWS = require('aws-sdk');
const jscommon = require('js-common');

exports.handler = async (event, context) => {
  // We don't do much here
  return jscommon.generateSuccessResponse("Info about our function");
}
