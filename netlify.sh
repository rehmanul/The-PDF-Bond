#!/bin/bash

# Install necessary packages
pip install -r requirements.txt

# Create directories
mkdir -p netlify/functions
mkdir -p static/js
mkdir -p static/css
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

# Copy static files if needed
if [ ! -f static/index.html ]; then
  cp -r templates/* static/ 2>/dev/null || :
  # Update file paths in HTML files
  find static -name "*.html" -type f -exec sed -i 's|{{ url_for('"'"'static'"'"', filename='"'"'\([^'"'"']*\)'"'"') }}|/\1|g' {} \;
fi

# Ensure netlify functions directory exists
mkdir -p netlify/functions

# Ensure function exists (from original script)
if [ ! -f netlify/functions/api.py ]; then
    echo "Creating netlify/functions/api.py..."
    cp attached_assets/api.py netlify/functions/api.py
fi

# Copy API function to netlify/functions (from original script)
cp -f attached_assets/api.py netlify/functions/api.py

# Ensure the functions directory has proper permissions (from original script)
chmod -R 755 netlify/functions

# Create an empty api_keys.json file if it doesn't exist (from original script)
touch api_keys.json
chmod 644 api_keys.json

# Install Node.js and npm (from original script)
if ! command -v node &> /dev/null; then
    echo "Node.js is required for deployment with Netlify CLI."
    echo "Please install Node.js on your system or use the Netlify web UI for deployment."
    echo "Visit https://nodejs.org/en/download/ for installation instructions."
    exit 1
fi

# Install Netlify CLI (from original script)
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install netlify-cli -g
fi


# Deploy to Netlify (from original script)
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"
echo "Your site should now be accessible at the Netlify URL."
echo "If you encounter any issues with menu functionality, check the browser console for errors."