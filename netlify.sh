#!/bin/bash
set -e

echo "Starting Netlify deployment..."

# Create necessary directories
mkdir -p netlify/functions
mkdir -p static/js
mkdir -p static/css
mkdir -p static/img

# Install dependencies
echo "Installing Python dependencies..."
# Check if requirements.txt exists in the root directory
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
# If not, check if it exists in attached_assets directory
elif [ -f "attached_assets/requirements.txt" ]; then
  pip install -r attached_assets/requirements.txt
else
  # Create a minimal requirements.txt file if it doesn't exist
  echo "requirements.txt not found, creating one..."
  cat > requirements.txt << EOF
Flask>=3.1.0
openpyxl>=3.1.5
pandas>=2.2.3
pdfplumber>=0.11.6
PyPDF2>=3.0.1
requests>=2.32.3
Werkzeug>=3.1.3
gunicorn>=23.0.0
email-validator>=2.0.0
flask-sqlalchemy>=3.1.0
psycopg2-binary>=2.9.9
xlsxwriter>=3.2.1
numpy>=1.26.4
Pillow>=10.2.0
EOF
  pip install -r requirements.txt
fi

# Copy static files
echo "Copying static files..."
# Templates are already in static folder

# Rename files for URL compatibility if needed
if [ -f static/benefit_extraction.html ] && [ ! -f static/benefit-extraction.html ]; then
  mv static/benefit_extraction.html static/benefit-extraction.html
fi

if [ -f static/api_keys.html ] && [ ! -f static/api-keys.html ]; then
  mv static/api_keys.html static/api-keys.html
fi

# Make sure we have JS files
echo "Setting up JavaScript files..."
if [ ! -f static/js/script.js ]; then
  cp -r static/js/script.js static/js/script.js 2>/dev/null || cp -r attached_assets/script.js static/js/script.js 2>/dev/null || echo "Warning: Could not find script.js"
fi

if [ ! -f static/js/api_keys.js ]; then
  cp -r static/js/api_keys.js static/js/api_keys.js 2>/dev/null || cp -r attached_assets/api_keys.js static/js/api_keys.js 2>/dev/null || echo "Warning: Could not find api_keys.js"
fi

if [ ! -f static/js/benefit_extraction.js ]; then
  cp -r static/js/benefit_extraction.js static/js/benefit_extraction.js 2>/dev/null || cp -r attached_assets/benefit_extraction.js static/js/benefit_extraction.js 2>/dev/null || echo "Warning: Could not find benefit_extraction.js"
fi

# Make sure we have CSS files
echo "Setting up CSS files..."
if [ ! -f static/css/style.css ]; then
  cp -r static/css/style.css static/css/style.css 2>/dev/null || cp -r attached_assets/style.css static/css/style.css 2>/dev/null || echo "Warning: Could not find style.css"
fi

# Prepare Netlify functions
echo "Setting up Netlify functions..."
mkdir -p netlify/functions
if [ ! -f netlify/functions/api.py ]; then
  cp -r attached_assets/api.py netlify/functions/api.py 2>/dev/null || echo "Warning: Could not find api.py"
fi

# Create Netlify function configuration
cat > netlify/functions/api.js << 'EOL'
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
EOL

# Create an empty file to ensure directories exist
touch static/img/.gitkeep

echo "Netlify deployment setup complete!"