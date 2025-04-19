const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.handler = async function(event, context) {
  console.log(`Received request: ${event.path} [${event.httpMethod}]`);
  
  // Check if this is a request for a static file
  if (event.path.startsWith('/static/') || 
      event.path.startsWith('/uploads/') || 
      event.path.startsWith('/outputs/')) {
    try {
      // Extract the file path
      const filePath = path.join(process.cwd(), 'public', event.path);
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return {
          statusCode: 404,
          body: 'File not found'
        };
      }
      
      // Read the file
      const fileData = fs.readFileSync(filePath);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (event.path.endsWith('.css')) contentType = 'text/css';
      else if (event.path.endsWith('.js')) contentType = 'application/javascript';
      else if (event.path.endsWith('.html')) contentType = 'text/html';
      else if (event.path.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (event.path.endsWith('.png')) contentType = 'image/png';
      else if (event.path.endsWith('.jpg') || event.path.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (event.path.endsWith('.pdf')) contentType = 'application/pdf';
      else if (event.path.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (event.path.endsWith('.json')) contentType = 'application/json';
      
      // Is this a binary file?
      const isBinary = !contentType.startsWith('text/') && 
                        contentType !== 'application/json' &&
                        contentType !== 'application/javascript';
      
      console.log(`Serving static file: ${event.path} (${contentType})`);
      
      // Return the file
      return {
        statusCode: 200,
        headers: { 'Content-Type': contentType },
        body: isBinary ? fileData.toString('base64') : fileData.toString('utf-8'),
        isBase64Encoded: isBinary
      };
    } catch (error) {
      console.error(`Error serving static file: ${error.message}`);
      return {
        statusCode: 500,
        body: `Error serving file: ${error.message}`
      };
    }
  }
  
  // Set up environment for Python
  process.env.PYTHONPATH = process.cwd();
  
  // Prepare the event data for the Python process
  const pythonEvent = {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers || {},
    queryStringParameters: event.queryStringParameters || {},
    body: event.body || '',
    isBase64Encoded: event.isBase64Encoded || false,
    requestContext: event.requestContext || {}
  };
  
  return new Promise((resolve, reject) => {
    // Spawn a Python process to handle the request
    const python = spawn('python3', [path.join(process.cwd(), 'netlify/functions/api.py')]);
    
    let dataString = '';
    let errorString = '';
    
    // Pass the event data to the Python process
    python.stdin.write(JSON.stringify(pythonEvent));
    python.stdin.end();
    
    // Collect data from the Python process
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`Python stderr: ${data.toString()}`);
    });
    
    // Handle the end of the Python process
    python.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      
      if (code !== 0) {
        console.error(`Python process error: ${errorString}`);
        resolve({
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Internal Server Error', 
            details: errorString,
            path: event.path,
            method: event.httpMethod
          })
        });
        return;
      }
      
      try {
        // Parse the JSON response from Python
        const response = JSON.parse(dataString);
        resolve({
          statusCode: response.statusCode,
          headers: response.headers || { 'Content-Type': 'application/json' },
          body: response.body,
          isBase64Encoded: response.isBase64Encoded || false
        });
      } catch (error) {
        console.error('Error parsing Python response:', error);
        console.error('Raw response:', dataString);
        
        resolve({
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Internal Server Error', 
            message: 'Invalid response format from Python handler',
            pythonOutput: dataString.substring(0, 1000) // Truncate to avoid huge responses
          })
        });
      }
    });
    
    // Handle process errors
    python.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Internal Server Error', 
          message: 'Failed to start Python process',
          details: err.message
        })
      });
    });
  });
};