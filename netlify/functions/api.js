const { spawn } = require('child_process');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const script = spawn('python', ['api.py', event.path, event.httpMethod, event.body]);
    let result = '';
    
    script.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    return new Promise((resolve, reject) => {
      script.on('close', (code) => {
        if (code !== 0) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred processing the request' })
          });
        }
        
        try {
          const parsedResult = JSON.parse(result);
          resolve({
            statusCode: 200,
            body: JSON.stringify(parsedResult)
          });
        } catch (e) {
          resolve({
            statusCode: 200,
            body: result
          });
        }
      });
    });
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};