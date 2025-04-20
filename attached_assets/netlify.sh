
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
pip install -r requirements.txt

# Copy static files
echo "Copying static files..."
cp -r templates/* static/
mv static/index.html static/index.html
mv static/api_keys.html static/api-keys.html
mv static/benefit_extraction.html static/benefit-extraction.html

# Make sure we have JS files
echo "Setting up JavaScript files..."
if [ ! -f static/js/script.js ]; then
  cp -r attached_assets/script.js static/js/script.js
fi

if [ ! -f static/js/api_keys.js ]; then
  cp -r attached_assets/api_keys.js static/js/api_keys.js
fi

if [ ! -f static/js/benefit_extraction.js ]; then
  cp -r attached_assets/benefit_extraction.js static/js/benefit_extraction.js
fi

# Make sure we have CSS files
echo "Setting up CSS files..."
if [ ! -f static/css/style.css ]; then
  cp -r attached_assets/style.css static/css/style.css
fi

# Prepare Netlify functions
echo "Setting up Netlify functions..."
if [ ! -f netlify/functions/api.py ]; then
  cp -r attached_assets/api.py netlify/functions/api.py
fi

# Create an empty file to ensure directories exist
touch static/img/.gitkeep

# Ensure the netlify.toml file exists
if [ ! -f netlify.toml ]; then
  cp -r attached_assets/netlify.toml ./netlify.toml
fi

echo "Netlify deployment setup complete!"
